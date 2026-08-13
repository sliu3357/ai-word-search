"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles, Clock, CheckCircle2, Play, Download, FileText, Gamepad2, Calendar, Loader2, AlertCircle } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { generatePdf } from "@/lib/export/pdf"
import type { PlacedWord } from "@/lib/word-search/types"

interface HistoryPuzzle {
  id: string
  title: string
  words: string[]
  settings: Record<string, unknown>
  grid: string[][]
  gridSize: number
  placedWords: PlacedWord[]
  unplacedWords: string[]
  createdAt: string
  gameStats: {
    total: number
    completed: number
    recent: {
      id: string
      foundWords: string[]
      completed: boolean
      durationSec: number | null
      createdAt: string
    }[]
  }
}

export default function DashboardPage() {
  const [puzzles, setPuzzles] = React.useState<HistoryPuzzle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/puzzle/history")
        if (res.status === 401) {
          setError("Please log in to view your puzzle history.")
          return
        }
        if (!res.ok) {
          setError("Failed to load history. Please try again.")
          return
        }
        const data = await res.json()
        setPuzzles(data.puzzles || [])
      } catch {
        setError("Network error. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleExportPdf = (puzzle: HistoryPuzzle) => {
    generatePdf(puzzle.title, {
      grid: puzzle.grid,
      placedWords: puzzle.placedWords,
      unplacedWords: puzzle.unplacedWords,
      gridSize: puzzle.gridSize,
      settings: puzzle.settings as never,
    })
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{error}</p>
              {error.includes("log in") && (
                <Button asChild className="mt-4">
                  <Link href="/login">Log in</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="container-app py-10 md:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              My Puzzles
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your generated puzzles and game history. Reload or export anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-app">
          {puzzles.length === 0 ? (
            <Card className="mx-auto max-w-md">
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">No puzzles yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate your first word search puzzle to see it here.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/word-search-maker">
                    <Sparkles className="h-4 w-4" />
                    Create Puzzle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {puzzles.map((puzzle) => (
                <Card key={puzzle.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">
                            {puzzle.title}
                          </h3>
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(puzzle.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {puzzle.words.length} words
                          </Badge>
                          <Badge variant="outline">
                            {puzzle.gridSize} × {puzzle.gridSize} grid
                          </Badge>
                          {puzzle.gameStats.total > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Gamepad2 className="h-3 w-3" />
                              {puzzle.gameStats.completed}/{puzzle.gameStats.total} games won
                            </Badge>
                          )}
                        </div>

                        {/* Word chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {puzzle.words.slice(0, 12).map((w) => (
                            <span
                              key={w}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground"
                            >
                              {w}
                            </span>
                          ))}
                          {puzzle.words.length > 12 && (
                            <span className="px-1 text-xs text-muted-foreground">
                              +{puzzle.words.length - 12} more
                            </span>
                          )}
                        </div>

                        {/* Recent game records */}
                        {puzzle.gameStats.recent.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Recent games:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {puzzle.gameStats.recent.slice(0, 3).map((g) => (
                                <div
                                  key={g.id}
                                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs"
                                >
                                  {g.completed ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className="text-muted-foreground">
                                    {g.foundWords.length}/{puzzle.placedWords.length} found
                                  </span>
                                  {g.durationSec && (
                                    <span className="text-muted-foreground">
                                      · {Math.floor(g.durationSec / 60)}m {g.durationSec % 60}s
                                    </span>
                                  )}
                                  <span className="text-muted-foreground">
                                    · {new Date(g.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row gap-2 sm:flex-col sm:w-40">
                        <Button asChild size="sm" className="flex-1 gap-1.5">
                          <Link
                            href={`/word-search-maker?puzzleId=${puzzle.id}`}
                          >
                            <Play className="h-3.5 w-3.5" />
                            Play
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => handleExportPdf(puzzle)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  )
}
