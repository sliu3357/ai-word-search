import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { resolveDbUserId } from "@/lib/resolve-user"

export async function GET() {
  try {
    const userId = await resolveDbUserId()
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const prisma = await getPrisma()

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    let transactions: any[] = []
    let txError: string | null = null
    try {
      transactions = await prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    } catch (txErr: any) {
      txError = txErr?.message || String(txErr)
      console.error("[credits] Transaction query failed:", txError)
    }

    const totalPurchased = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const totalUsed = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

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

    const response: Record<string, unknown> = {
      balance: user.creditBalance,
      subscriptionTier: user.subscriptionTier,
      totalPurchased,
      totalUsed,
      transactions: formattedTransactions,
    }

    if (txError) {
      response.warning = `Transaction history unavailable: ${txError}`
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[credits] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch credits" },
      { status: 500 }
    )
  }
}
