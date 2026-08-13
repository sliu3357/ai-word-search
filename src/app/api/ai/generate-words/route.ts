import { NextRequest, NextResponse } from "next/server"
import {
  generateWords,
  type Difficulty,
} from "@/lib/ai/word-generator"
import { auth } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"]

interface ReqBody {
  scene?: unknown
  difficulty?: unknown
}

interface SuccessResp {
  ok: true
  title: string
  words: string[]
  difficulty: Difficulty
  engine: "llm" | "rule"
  remainingCredits?: number | "unlimited" | null
}

interface ErrorResp {
  ok: false
  error: string
  code?: string
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/ai/generate-words
 * Body: { scene: string, difficulty: "easy" | "medium" | "hard" }
 *
 * Behaviour:
 *  - Always returns results — uses LLM if AI_API_KEY env is set,
 *    otherwise falls back to a deterministic rule engine.
 *  - Logged-in users on the free tier are charged 1 credit per call
 *    (same as puzzle generation). Guests and paid tiers are unlimited.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as ReqBody

    // --- Parameter validation ---------------------------------------
    if (typeof body.scene !== "string" || !body.scene.trim()) {
      return json<ErrorResp>(
        { ok: false, error: "Please describe a scene — e.g. 'a day at the zoo'." },
        400
      )
    }
    if (body.scene.length > 600) {
      return json<ErrorResp>(
        { ok: false, error: "Scene description is too long (max 600 characters)." },
        400
      )
    }
    const difficulty = (body.difficulty as Difficulty | undefined) ?? "medium"
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return json<ErrorResp>(
        { ok: false, error: `Invalid difficulty. Use one of: ${VALID_DIFFICULTIES.join(", ")}.` },
        400
      )
    }

    // --- Auth + credits ---------------------------------------------
    let userId: string | undefined
    try {
      const session = await auth()
      userId = session?.user?.id
    } catch (e) {
      console.warn("[ai-generate-words] auth check skipped:", (e as Error).message)
    }

    let remainingCredits: number | "unlimited" | null = null

    if (userId) {
      try {
        const prisma = await getPrisma()
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { creditBalance: true, subscriptionTier: true },
        })

        if (user?.subscriptionTier === "free" && (user.creditBalance ?? 0) <= 0) {
          return json<ErrorResp>(
            {
              ok: false,
              error:
                "Out of credits. Please upgrade your plan or sign in again.",
              code: "OUT_OF_CREDITS",
            },
            403
          )
        }

        if (user?.subscriptionTier === "free") {
          await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { decrement: 1 } },
          })
          await prisma.creditTransaction.create({
            data: {
              userId,
              amount: -1,
              type: "usage",
              description: `AI words: ${body.scene.slice(0, 60)}`,
            },
          })
          remainingCredits = (user.creditBalance ?? 1) - 1
        } else if (user && user.subscriptionTier !== "free") {
          remainingCredits = "unlimited"
        }
      } catch (dbErr) {
        console.warn(
          "[ai-generate-words] DB credit flow skipped:",
          (dbErr as Error).message
        )
      }
    }

    // --- Generate ----------------------------------------------------
    const result = await generateWords({
      scene: body.scene,
      difficulty,
    })

    return json<SuccessResp>({
      ok: true,
      title: result.title,
      words: result.words,
      difficulty: result.difficulty,
      engine: result.engine,
      remainingCredits,
    })
  } catch (err) {
    console.error("[ai-generate-words] unexpected error:", err)
    return json<ErrorResp>(
      {
        ok: false,
        error:
          err instanceof Error && /required|configured/i.test(err.message)
            ? err.message
            : "Something went wrong generating words. Please try again.",
      },
      500
    )
  }
}

function json<T>(body: T, status = 200) {
  return NextResponse.json(body as object, { status })
}
