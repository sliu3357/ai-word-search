import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { resolveDbUserId } from "@/lib/resolve-user"

/** GET /api/orders — 获取当前用户的订阅和订单记录 */
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
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        creditBalance: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 获取订阅记录
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    // 获取与订单相关的 CreditTransaction (purchase / subscription 类型)
    const orderTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        type: { in: ["purchase", "subscription"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // 订阅 tier 映射
    const tierLabels: Record<string, string> = {
      free: "Free",
      basic: "Basic",
      pro: "Pro",
    }

    const statusLabels: Record<string, { label: string; color: string }> = {
      active: { label: "Active", color: "text-green-600 bg-green-50 border-green-200" },
      canceled: { label: "Canceled", color: "text-red-600 bg-red-50 border-red-200" },
      expired: { label: "Expired", color: "text-gray-600 bg-gray-50 border-gray-200" },
      past_due: { label: "Past Due", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    }

    const formattedSubscriptions = subscriptions.map((s) => ({
      id: s.id,
      tier: s.tier,
      tierLabel: tierLabels[s.tier] || s.tier,
      status: s.status,
      statusLabel: statusLabels[s.status]?.label || s.status,
      statusColor: statusLabels[s.status]?.color || "text-foreground",
      currentPeriodStart: s.currentPeriodStart?.toISOString() || null,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      createdAt: s.createdAt.toISOString(),
      stripePriceId: s.stripePriceId || null,
    }))

    const formattedOrders = orderTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      date: t.createdAt.toISOString(),
      type: t.type,
      stripePaymentIntentId: t.stripePaymentIntentId || null,
    }))

    // 当前活跃订阅
    const activeSubscription = subscriptions.find((s) => s.status === "active")

    return NextResponse.json({
      user: {
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        creditBalance: user.creditBalance,
      },
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            tier: activeSubscription.tier,
            tierLabel: tierLabels[activeSubscription.tier] || activeSubscription.tier,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.currentPeriodEnd?.toISOString() || null,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null,
      subscriptions: formattedSubscriptions,
      orders: formattedOrders,
    })
  } catch (error) {
    console.error("[orders] Error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}