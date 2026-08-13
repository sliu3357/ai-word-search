"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Puzzle as PuzzleIcon } from "lucide-react"

interface AdminPuzzle {
  id: string
  title: string
  userEmail: string
  userName: string | null
  isPublic: boolean
  gameCount: number
  words: string[]
  createdAt: string
}

export default function AdminPuzzlesPage() {
  const [puzzles, setPuzzles] = React.useState<AdminPuzzle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/admin/puzzles")
      .then((r) => {
        if (r.status === 403) throw new Error("Admin access required")
        if (!r.ok) throw new Error("Failed to load puzzles")
        return r.json()
      })
      .then((data) => setPuzzles(data.puzzles))
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
              <h3 className="text-lg font-bold text-foreground">All User Puzzles</h3>
              <Badge variant="outline">{puzzles.length} puzzles</Badge>
            </div>

            {puzzles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PuzzleIcon className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No puzzles found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {puzzles.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-foreground">{p.title}</p>
                        {p.isPublic && (
                          <Badge variant="outline" className="shrink-0 text-green-600 border-green-200 bg-green-50">
                            Public
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        by {p.userName || p.userEmail}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.words.slice(0, 8).map((w, i) => (
                          <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {w}
                          </span>
                        ))}
                        {p.words.length > 8 && (
                          <span className="text-xs text-muted-foreground">+{p.words.length - 8}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Games</p>
                        <p className="font-semibold text-foreground">{p.gameCount}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  )
}
