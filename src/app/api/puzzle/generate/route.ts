import { NextRequest, NextResponse } from "next/server"
import { generateWordSearch } from "@/lib/word-search/generator"
import type { PuzzleSettings } from "@/lib/word-search/types"
import { getPrisma } from "@/lib/prisma"
import { resolveDbUserId } from "@/lib/resolve-user"

/** 未登录用户每日生成限制 */
const GUEST_DAILY_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { words, settings, title } = body as {
      words: string[]
      settings: PuzzleSettings
      title?: string
    }

    // 参数校验
    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "Words list is required and must not be empty" },
        { status: 400 }
      )
    }

    if (words.length > 40) {
      return NextResponse.json(
        { error: "Maximum 40 words allowed" },
        { status: 400 }
      )
    }

    // 默认设置
    const defaultSettings: PuzzleSettings = {
      caseMode: "upper",
      directionMode: "orthogonal",
      includeBackward: false,
      includeDiagonal: false,
      fontSize: "medium",
      paperSize: "a4",
    }

    const finalSettings: PuzzleSettings = {
      ...defaultSettings,
      ...settings,
    }

    // 生成游戏（纯算法，不依赖数据库）
    const result = generateWordSearch(words, finalSettings)

    // 获取用户信息（如果有）
    let userId: string | null = null
    try {
      userId = await resolveDbUserId()
    } catch (e) {
      console.warn("[generate] auth check skipped:", (e as Error).message)
    }

    // 未登录用户：直接返回结果，不保存
    if (!userId) {
      return NextResponse.json({
        grid: result.grid,
        placedWords: result.placedWords,
        unplacedWords: result.unplacedWords,
        gridSize: result.gridSize,
        settings: result.settings,
        guestLimit: GUEST_DAILY_LIMIT,
      })
    }

    // 登录用户：尝试操作数据库（失败时回退到guest模式返回结果）
    try {
      const prisma = await getPrisma()

      // 检查Credit余额
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true, subscriptionTier: true },
      })

      if (user && user.subscriptionTier === "free" && user.creditBalance <= 0) {
        return NextResponse.json(
          {
            error:
              "Out of credits. Please upgrade your subscription to continue.",
            code: "OUT_OF_CREDITS",
          },
          { status: 403 }
        )
      }

      let remainingCredits: number | "unlimited" | null = null
      if (user && user.subscriptionTier === "free") {
        // 消耗Credit
        await prisma.user.update({
          where: { id: userId },
          data: { creditBalance: { decrement: 1 } },
        })

        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: -1,
            type: "usage",
            description: `Generated puzzle: ${title || "Untitled"}`,
          },
        })
        remainingCredits = user.creditBalance - 1
      } else if (user && user.subscriptionTier !== "free") {
        remainingCredits = "unlimited"
      }

      // 保存历史记录
      const puzzle = await prisma.puzzleHistory.create({
        data: {
          userId,
          title: title || "Untitled Puzzle",
          words: words,
          settings: finalSettings as object,
          gridData: { grid: result.grid, gridSize: result.gridSize } as object,
          answerKey: {
            placedWords: result.placedWords,
            unplacedWords: result.unplacedWords,
          } as object,
        },
      })

      return NextResponse.json({
        puzzleId: puzzle.id,
        grid: result.grid,
        placedWords: result.placedWords,
        unplacedWords: result.unplacedWords,
        gridSize: result.gridSize,
        settings: result.settings,
        remainingCredits,
      })
    } catch (dbErr) {
      console.warn("[generate] DB operation skipped, returning guest result:", (dbErr as Error).message)
      return NextResponse.json({
        grid: result.grid,
        placedWords: result.placedWords,
        unplacedWords: result.unplacedWords,
        gridSize: result.gridSize,
        settings: result.settings,
        guestLimit: GUEST_DAILY_LIMIT,
      })
    }
  } catch (error) {
    console.error("Puzzle generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate puzzle. Please try again." },
      { status: 500 }
    )
  }
}
