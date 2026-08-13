import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/puzzles — 获取所有用户生成的谜题 */
export async function GET(request: Request) {
  try {
    const ctx = await requireAdmin()
    if (!ctx) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const { prisma } = ctx

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const puzzles = await prisma.puzzleHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { gameRecords: true } },
      },
    })

    return NextResponse.json({
      puzzles: puzzles.map((p) => ({
        id: p.id,
        title: p.title,
        userEmail: p.user?.email || "Unknown",
        userName: p.user?.name || "",
        isPublic: p.isPublic,
        gameCount: p._count.gameRecords,
        words: p.words as string[],
        createdAt: p.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[admin/puzzles] Error:", error)
    return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 })
  }
}
