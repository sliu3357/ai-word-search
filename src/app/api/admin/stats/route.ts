import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/stats — 管理员仪表盘统计数据 */
export async function GET() {
  try {
    const ctx = await requireAdmin()
    if (!ctx) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const { prisma } = ctx

    const [
      totalUsers,
      totalPuzzles,
      totalGames,
      totalCredits,
      totalTransactions,
      activeSubscriptions,
      recentUsers,
      recentPuzzles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.puzzleHistory.count(),
      prisma.gameRecord.count(),
      prisma.user.aggregate({ _sum: { creditBalance: true } }),
      prisma.creditTransaction.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          creditBalance: true,
          subscriptionTier: true,
          createdAt: true,
        },
      }),
      prisma.puzzleHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
    ])

    // 按天统计近7天新增用户
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentUsersByDay = await prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    })

    const dailyStats: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dailyStats[key] = 0
    }
    for (const u of recentUsersByDay) {
      const key = u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (key in dailyStats) dailyStats[key]++
    }

    // 按 tier 统计用户分布
    const tierCounts = await prisma.user.groupBy({
      by: ["subscriptionTier"],
      _count: true,
    })
    const tierDistribution: Record<string, number> = {
      free: 0,
      basic: 0,
      pro: 0,
    }
    for (const t of tierCounts) {
      tierDistribution[t.subscriptionTier] = t._count
    }

    return NextResponse.json({
      totals: {
        users: totalUsers,
        puzzles: totalPuzzles,
        games: totalGames,
        creditsInSystem: totalCredits._sum.creditBalance ?? 0,
        transactions: totalTransactions,
        activeSubscriptions,
      },
      tierDistribution,
      dailyNewUsers: Object.entries(dailyStats).map(([date, count]) => ({ date, count })),
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentPuzzles: recentPuzzles.map((p) => ({
        id: p.id,
        title: p.title,
        userEmail: p.user?.email || "Unknown",
        userName: p.user?.name || "",
        createdAt: p.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[admin/stats] Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
