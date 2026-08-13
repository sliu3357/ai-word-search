"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package,
  Gift,
  ShoppingCart,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CreditTransaction {
  id: string
  amount: number
  type: string
  typeLabel: string
  typeColor: string
  description: string
  date: string
  isPositive: boolean
}

interface CreditsData {
  balance: number
  subscriptionTier: string
  totalPurchased: number
  totalUsed: number
  transactions: CreditTransaction[]
}

const typeIconMap: Record<string, React.ReactNode> = {
  purchase: <ShoppingCart className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
  usage: <Package className="h-4 w-4" />,
  subscription: <Sparkles className="h-4 w-4" />,
  refund: <RotateCcw className="h-4 w-4" />,
}

export function MyCredits() {
  const [data, setData] = React.useState<CreditsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/credits")
        if (res.status === 401) {
          setError("Please log in to view your credits.")
          return
        }
        if (!res.ok) {
          setError("Failed to load credits.")
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
    fetchCredits()
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

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-secondary to-secondary/80 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Current Balance</p>
              <div className="mt-2 flex items-baseline gap-2">
                <Sparkles className="h-8 w-8" />
                <span className="text-5xl font-bold">{data.balance}</span>
                <span className="text-lg text-white/80">Credits</span>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {data.subscriptionTier === "free"
                  ? "Free plan"
                  : `${data.subscriptionTier?.toUpperCase()} plan`}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-secondary hover:bg-white/90 font-semibold"
              >
                <Link href="/pricing">
                  <Plus className="h-4 w-4" />
                  Get More Credits
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-xs text-white/70">Total Purchased</p>
              <p className="mt-1 text-2xl font-semibold">{data.totalPurchased}</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Total Used</p>
              <p className="mt-1 text-2xl font-semibold">{data.totalUsed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
            <Badge variant="outline">{data.transactions.length} records</Badge>
          </div>

          {data.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No transactions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Purchase credits or generate puzzles to see activity here.
              </p>
              <Button asChild className="mt-4">
                <Link href="/pricing">
                  <Plus className="h-4 w-4" />
                  Purchase Credits
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="py-3 text-right font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 font-medium ${t.typeColor}`}>
                          {typeIconMap[t.type] || <Package className="h-4 w-4" />}
                          {t.typeLabel}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${t.isPositive ? "text-green-600" : "text-orange-600"}`}>
                        <span className="inline-flex items-center gap-1">
                          {t.isPositive ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {t.isPositive ? "+" : "-"}
                          {Math.abs(t.amount)}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(t.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
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
    </div>
  )
}