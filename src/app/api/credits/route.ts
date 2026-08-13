import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/** GET /api/credits — 获取当前用户的积分余额和交易记录 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        creditBalance: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    // 计算统计数据
    const totalPurchased = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const totalUsed = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // 类型映射为可读的 label
    const typeLabels: Record<string, { label: string; color: string }> = {
      purchase: { label: "Purchase", color: "text-green-600" },
      gift: { label: "Gift", color: "text-blue-600" },
      usage: { label: "Usage", color: "text-orange-600" },
      subscription: { label: "Subscription", color: "text-purple-600" },
      refund: { label: "Refund", color: "text-gray-600" },
    }

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      typeLabel: typeLabels[t.type]?.label || t.type,
      typeColor: typeLabels[t.type]?.color || "text-foreground",
      description: t.description,
      date: t.createdAt.toISOString(),
      isPositive: t.amount > 0,
    }))

    return NextResponse.json({
      balance: user.creditBalance,
      subscriptionTier: user.subscriptionTier,
      totalPurchased,
      totalUsed,
      transactions: formattedTransactions,
    })
  } catch (error) {
    console.error("[credits] Error:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}