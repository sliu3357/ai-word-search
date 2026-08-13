import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

/** GET /api/admin/credits — 获取所有用户的积分交易记录 */
export async function GET(request: Request) {
  try {
    const ctx = await requireAdmin()
    if (!ctx) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const { prisma } = ctx

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "100")

    const transactions = await prisma.creditTransaction.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    })

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        userEmail: t.user?.email || "Unknown",
        userName: t.user?.name || "",
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[admin/credits] Error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
