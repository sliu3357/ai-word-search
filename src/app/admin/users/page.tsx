"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Search, Sparkles, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  creditBalance: number
  subscriptionTier: string
  subscriptionStatus: string
  createdAt: string
  _count: {
    puzzleHistories: number
    gameRecords: number
    creditTransactions: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [adjustingId, setAdjustingId] = React.useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = React.useState("10")
  const [adjustDesc, setAdjustDesc] = React.useState("")

  const fetchUsers = React.useCallback(() => {
    setLoading(true)
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) throw new Error("Admin access required")
        if (!r.ok) throw new Error("Failed to load users")
        return r.json()
      })
      .then((data) => setUsers(data.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleAdjustCredits(userId: string) {
    const amount = parseInt(adjustAmount)
    if (!amount || amount === 0) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjustCredits",
          amount,
          description: adjustDesc || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Failed to adjust credits")
        return
      }
      setAdjustingId(null)
      setAdjustAmount("10")
      setAdjustDesc("")
      fetchUsers()
    } catch {
      alert("Network error")
    }
  }

  async function handleChangeRole(userId: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeRole", role }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Failed to change role")
        return
      }
      fetchUsers()
    } catch {
      alert("Network error")
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

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
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  All Users
                </h3>
                <Badge variant="outline">{filteredUsers.length} users</Badge>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Role</th>
                      <th className="py-3 pr-4 text-center font-medium text-muted-foreground">Credits</th>
                      <th className="py-3 pr-4 text-center font-medium text-muted-foreground">Plan</th>
                      <th className="py-3 pr-4 text-center font-medium text-muted-foreground">Puzzles</th>
                      <th className="py-3 pr-4 text-center font-medium text-muted-foreground">Games</th>
                      <th className="py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <React.Fragment key={u.id}>
                        <tr className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-foreground">{u.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={u.role === "admin" ? "border-purple-200 bg-purple-50 text-purple-600" : ""}
                            >
                              {u.role === "admin" && <ShieldCheck className="mr-1 h-3 w-3" />}
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Sparkles className="h-3 w-3 text-orange-500" />
                              {u.creditBalance}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-center capitalize text-muted-foreground">
                            {u.subscriptionTier}
                          </td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">
                            {u._count.puzzleHistories}
                          </td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">
                            {u._count.gameRecords}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAdjustingId(adjustingId === u.id ? null : u.id)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                        {adjustingId === u.id && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="p-4">
                              <div className="flex flex-wrap items-end gap-4">
                                <div>
                                  <label className="mb-1 block text-xs text-muted-foreground">Adjust Credits</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={adjustAmount}
                                      onChange={(e) => setAdjustAmount(e.target.value)}
                                      className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm"
                                    />
                                    <Button size="sm" variant="outline" onClick={() => setAdjustAmount(String(parseInt(adjustAmount) + 10))}>
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setAdjustAmount(String(parseInt(adjustAmount) - 10))}>
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                  <label className="mb-1 block text-xs text-muted-foreground">Description (optional)</label>
                                  <input
                                    type="text"
                                    value={adjustDesc}
                                    onChange={(e) => setAdjustDesc(e.target.value)}
                                    placeholder="Reason for adjustment..."
                                    className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAdjustCredits(u.id)}
                                    className="bg-secondary text-white"
                                  >
                                    Apply
                                  </Button>
                                  {u.role !== "admin" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleChangeRole(u.id, "admin")}
                                    >
                                      Make Admin
                                    </Button>
                                  )}
                                  {u.role === "admin" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleChangeRole(u.id, "user")}
                                    >
                                      Remove Admin
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{u.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant="outline" className={u.role === "admin" ? "border-purple-200 bg-purple-50 text-purple-600" : ""}>
                        {u.role}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Credits</p>
                        <p className="font-semibold">{u.creditBalance}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Puzzles</p>
                        <p className="font-semibold">{u._count.puzzleHistories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Games</p>
                        <p className="font-semibold">{u._count.gameRecords}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => setAdjustingId(adjustingId === u.id ? null : u.id)}
                    >
                      {adjustingId === u.id ? "Close" : "Manage"}
                    </Button>
                    {adjustingId === u.id && (
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
                          placeholder="Amount"
                        />
                        <input
                          type="text"
                          value={adjustDesc}
                          onChange={(e) => setAdjustDesc(e.target.value)}
                          placeholder="Description..."
                          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
                        />
                        <Button size="sm" className="w-full bg-secondary text-white" onClick={() => handleAdjustCredits(u.id)}>
                          Apply Credits
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
