"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Puzzle, Gamepad2, Sparkles, CreditCard, TrendingUp, Loader2, AlertCircle } from "lucide-react"

interface StatsData {
  totals: {
    users: number
    puzzles: number
    games: number
    creditsInSystem: number
    transactions: number
    activeSubscriptions: number
  }
  tierDistribution: Record<string, number>
  dailyNewUsers: { date: string; count: number }[]
  recentUsers: {
    id: string
    email: string
    name: string | null
    creditBalance: number
    subscriptionTier: string
    createdAt: string
  }[]
  recentPuzzles: {
    id: string
    title: string
    userEmail: string
    userName: string | null
    createdAt: string
  }[]
}

const statCards = [
  { key: "users", label: "Total Users", icon: Users, color: "text-blue-600 bg-blue-50" },
  { key: "puzzles", label: "Puzzles Generated", icon: Puzzle, color: "text-purple-600 bg-purple-50" },
  { key: "games", label: "Games Played", icon: Gamepad2, color: "text-green-600 bg-green-50" },
  { key: "creditsInSystem", label: "Credits in System", icon: Sparkles, color: "text-orange-600 bg-orange-50" },
  { key: "transactions", label: "Credit Transactions", icon: CreditCard, color: "text-teal-600 bg-teal-50" },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: TrendingUp, color: "text-pink-600 bg-pink-50" },
] as const

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<StatsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403) throw new Error("Admin access required")
        if (!r.ok) throw new Error("Failed to load stats")
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // 数据结构防御：任何缺失字段都给默认值，避免运行时崩溃白屏
  const safeData = data
    ? {
        totals: {
          users: 0,
          puzzles: 0,
          games: 0,
          creditsInSystem: 0,
          transactions: 0,
          activeSubscriptions: 0,
          ...(data.totals || {}),
        },
        tierDistribution: data.tierDistribution && typeof data.tierDistribution === "object" ? data.tierDistribution : {},
        dailyNewUsers: Array.isArray(data.dailyNewUsers) ? data.dailyNewUsers : [],
        recentUsers: Array.isArray(data.recentUsers) ? data.recentUsers : [],
        recentPuzzles: Array.isArray(data.recentPuzzles) ? data.recentPuzzles : [],
      }
    : null

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : safeData ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon
              const value = safeData.totals[card.key]
              return (
                <Card key={card.key}>
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Tier Distribution & Daily New Users */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-base font-bold text-foreground">Subscription Distribution</h3>
                {Object.keys(safeData.tierDistribution).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No subscription data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(safeData.tierDistribution).map(([tier, count]) => {
                      const pct = safeData.totals.users > 0 ? Math.round((count / safeData.totals.users) * 100) : 0
                      const colors: Record<string, string> = {
                        free: "bg-gray-400",
                        basic: "bg-blue-500",
                        pro: "bg-purple-500",
                      }
                      return (
                        <div key={tier}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium capitalize text-foreground">{tier}</span>
                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full ${colors[tier] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-base font-bold text-foreground">New Users (Last 7 Days)</h3>
                {safeData.dailyNewUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No new users in the last 7 days.</p>
                ) : (
                  <div className="flex items-end gap-2 h-32">
                    {safeData.dailyNewUsers.map((d) => (
                      <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md bg-secondary/70 hover:bg-secondary transition-colors"
                          style={{ height: `${Math.max(d.count * 30, 4)}px` }}
                          title={`${d.count} users`}
                        />
                        <span className="text-[10px] text-muted-foreground">{d.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Users & Recent Puzzles */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-base font-bold text-foreground">Recent Users</h3>
                {safeData.recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent users.</p>
                ) : (
                  <div className="space-y-2">
                    {safeData.recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {u.name || u.email}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className="capitalize">{u.subscriptionTier}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-base font-bold text-foreground">Recent Puzzles</h3>
                {safeData.recentPuzzles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No puzzles generated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {safeData.recentPuzzles.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            by {p.userName || p.userEmail}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No admin data available. Please try again.</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  )
}
