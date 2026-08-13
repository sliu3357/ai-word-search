import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/users — 获取所有用户列表 */
export async function GET() {
  try {
    const ctx = await requireAdmin()
    if (!ctx) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const { prisma } = ctx

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: {
          select: {
            puzzleHistories: true,
            gameRecords: true,
            creditTransactions: true,
          },
        },
      },
    })

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[admin/users] Error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
