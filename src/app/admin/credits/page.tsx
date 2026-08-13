"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface AdminTransaction {
  id: string
  userId: string
  userEmail: string
  userName: string | null
  amount: number
  type: string
  description: string
  date: string
}

const typeColors: Record<string, string> = {
  purchase: "text-green-600",
  gift: "text-blue-600",
  usage: "text-orange-600",
  subscription: "text-purple-600",
  refund: "text-gray-600",
}

export default function AdminCreditsPage() {
  const [transactions, setTransactions] = React.useState<AdminTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/admin/credits")
      .then((r) => {
        if (r.status === 403) throw new Error("Admin access required")
        if (!r.ok) throw new Error("Failed to load transactions")
        return r.json()
      })
      .then((data) => setTransactions(data.transactions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">All Credit Transactions</h3>
              <Badge variant="outline">{transactions.length} records</Badge>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Description</th>
                      <th className="py-3 pr-4 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="py-3 text-right font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-foreground">{t.userName || t.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{t.userEmail}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-medium capitalize ${typeColors[t.type] || "text-foreground"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 max-w-xs truncate text-muted-foreground">
                          {t.description}
                        </td>
                        <td className={`py-3 pr-4 text-right font-semibold ${t.amount > 0 ? "text-green-600" : "text-orange-600"}`}>
                          <span className="inline-flex items-center gap-1">
                            {t.amount > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {t.amount > 0 ? "+" : ""}{t.amount}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  )
}
