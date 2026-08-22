import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { resolveDbUserId } from "@/lib/resolve-user"

/** GET /api/puzzle/[id] — 获取单个已保存的谜题（含游戏统计） */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveDbUserId()
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Puzzle id is required" }, { status: 400 })
    }

    const prisma = await getPrisma()

    const p = await prisma.puzzleHistory.findFirst({
      where: { id, userId },
      include: {
        gameRecords: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!p) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 })
    }

    const gridData = p.gridData as { grid: string[][]; gridSize: number }
    const answerKey = p.answerKey as {
      placedWords: {
        word: string
        row: number
        col: number
        direction: string
        backward: boolean
        cells: { row: number; col: number }[]
      }[]
      unplacedWords: string[]
    }
    const settings = p.settings as Record<string, unknown>

    const totalGames = p.gameRecords.length
    const completedGames = p.gameRecords.filter((g) => g.completed).length

    return NextResponse.json({
      id: p.id,
      title: p.title,
      words: p.words,
      settings,
      grid: gridData.grid,
      gridSize: gridData.gridSize,
      placedWords: answerKey.placedWords,
      unplacedWords: answerKey.unplacedWords,
      createdAt: p.createdAt,
      gameStats: {
        total: totalGames,
        completed: completedGames,
        recent: p.gameRecords.map((g) => ({
          id: g.id,
          foundWords: g.foundWords,
          completed: g.completed,
          durationSec: g.durationSec,
          createdAt: g.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("[puzzle/[id]] Error:", error)
    return NextResponse.json({ error: "Failed to fetch puzzle" }, { status: 500 })
  }
}
