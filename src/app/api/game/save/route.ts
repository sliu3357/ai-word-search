import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { resolveDbUserId } from "@/lib/resolve-user"

/** POST /api/game/save — 保存游戏对局记录 */
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveDbUserId()
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const body = await request.json()
    const { puzzleId, foundWords, completed, durationSec } = body as {
      puzzleId: string
      foundWords: string[]
      completed: boolean
      durationSec?: number
    }

    if (!puzzleId) {
      return NextResponse.json({ error: "puzzleId is required" }, { status: 400 })
    }

    const prisma = await getPrisma()

    // Verify puzzle belongs to user
    const puzzle = await prisma.puzzleHistory.findFirst({
      where: { id: puzzleId, userId },
      select: { id: true },
    })

    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 })
    }

    const record = await prisma.gameRecord.create({
      data: {
        userId,
        puzzleId,
        foundWords: foundWords || [],
        completed: !!completed,
        durationSec: durationSec ?? null,
      },
    })

    return NextResponse.json({ success: true, recordId: record.id })
  } catch (error) {
    console.error("[game/save] Error:", error)
    return NextResponse.json({ error: "Failed to save game record" }, { status: 500 })
  }
}
