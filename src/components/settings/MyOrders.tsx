"use client"

import * as React from "react"
import Link from "next/link"
import {
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  ShoppingBag,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Subscription {
  id: string
  tier: string
  tierLabel: string
  status: string
  statusLabel: string
  statusColor: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  stripePriceId: string | null
}

interface Order {
  id: string
  amount: number
  description: string
  date: string
  type: string
  stripePaymentIntentId: string | null
}

interface ActiveSubscription {
  id: string
  tier: string
  tierLabel: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface OrdersData {
  user: {
    email: string
    subscriptionTier: string
    subscriptionStatus: string
    creditBalance: number
  }
  activeSubscription: ActiveSubscription | null
  subscriptions: Subscription[]
  orders: Order[]
}

const tierIcons: Record<string, React.ReactNode> = {
  free: <XCircle className="h-5 w-5" />,
  basic: <CreditCard className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
}

const tierColors: Record<string, string> = {
  free: "from-gray-400 to-gray-500",
  basic: "from-blue-500 to-blue-600",
  pro: "from-purple-500 to-pink-500",
}

export function MyOrders() {
  const [data, setData] = React.useState<OrdersData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders")
        if (res.status === 401) {
          setError("Please log in to view your orders.")
          return
        }
        if (!res.ok) {
          setError("Failed to load orders.")
          return
        }
        const result = await res.json()
        setData(result)
      } catch {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No order data available. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  const { activeSubscription, subscriptions, orders } = data

  return (
    <div className="space-y-6">
      {/* Current Subscription / Active Plan */}
      {activeSubscription ? (
        <Card
          className={`overflow-hidden bg-gradient-to-br ${tierColors[activeSubscription.tier] || tierColors.free} text-white`}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  {tierIcons[activeSubscription.tier] || <CreditCard className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{activeSubscription.tierLabel} Plan</h3>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {activeSubscription.status}
                    </Badge>
                  </div>
                  {activeSubscription.currentPeriodEnd && (
                    <p className="mt-1 text-sm text-white/80">
                      {activeSubscription.cancelAtPeriodEnd
                        ? "Cancels on "
                        : "Renews on "}
                      {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {activeSubscription.cancelAtPeriodEnd ? (
                  <Button
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/20 hover:text-white"
                    asChild
                  >
                    <Link href="/pricing">
                      Reactivate <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/20 hover:text-white"
                    asChild
                  >
                    <Link href="/pricing">
                      Manage Plan <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Sparkles className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Active Subscription</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              You are currently on the Free plan. Upgrade to unlock more credits and exclusive features.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/pricing">
                  View Plans <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Order History</h3>
            <Badge variant="outline">{orders.length} orders</Badge>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your purchase and subscription history will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Order
                    </th>
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                      Credits
                    </th>
                    <th className="py-3 text-right font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-medium text-foreground">
                          #{o.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-xs truncate">
                        {o.description}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className="gap-1 text-green-600 border-green-200 bg-green-50"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-green-600">
                        +{o.amount}
                      </td>
                      <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(o.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Subscription History</h3>
              <Badge variant="outline">{subscriptions.length} records</Badge>
            </div>

            <div className="space-y-3">
              {subscriptions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tierColors[s.tier] || tierColors.free} text-white`}
                    >
                      {tierIcons[s.tier] || <CreditCard className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {s.tierLabel} Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.currentPeriodStart
                          ? `${new Date(s.currentPeriodStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : "Started"}{" "}
                        {s.currentPeriodEnd && (
                          <>
                            —{" "}
                            {new Date(s.currentPeriodEnd).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={s.statusColor}>
                    {s.status === "active" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {s.statusLabel}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}