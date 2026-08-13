import Link from "next/link"
import { ArrowRight, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SAMPLE_GRID = [
  ["C", "A", "T", "S", "D", "O", "G", "Q", "X", "Z"],
  ["B", "I", "R", "D", "S", "F", "I", "S", "H", "Y"],
  ["T", "R", "E", "E", "S", "P", "L", "A", "N", "T"],
  ["F", "L", "O", "W", "E", "R", "S", "U", "N", "M"],
  ["M", "O", "U", "N", "T", "A", "I", "N", "K", "O"],
  ["W", "A", "T", "E", "R", "R", "I", "V", "E", "R"],
  ["C", "L", "O", "U", "D", "S", "S", "K", "Y", "N"],
  ["S", "T", "A", "R", "S", "M", "O", "O", "N", "O"],
  ["W", "I", "N", "D", "R", "A", "I", "N", "S", "W"],
  ["L", "A", "K", "E", "O", "C", "E", "A", "N", "S"],
]

const HIGHLIGHTED_CELLS: Record<string, string> = {
  "0-0": "found",
  "0-1": "found",
  "0-2": "found",
  "0-3": "found",
  "1-1": "found",
  "2-1": "found",
  "3-1": "found",
  "1-0": "selected",
  "2-0": "selected",
  "3-5": "selected",
  "4-5": "selected",
  "5-5": "selected",
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary-light to-accent/10 py-16 md:py-24">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container-app relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <LayoutGrid className="h-4 w-4" />
              <span>Free &middot; No signup required</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Create Custom{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Word Search Puzzles
              </span>{" "}
              in Seconds
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              Make printable puzzles with your own vocabulary words. Perfect for
              teachers, parents, and homeschoolers. Choose from hundreds of
              grade-level and themed word lists, or create your own.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link href="/word-search-maker">
                  Start Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/word-search-generator">
                  Browse Templates
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>Printable PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>No signup</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card p-4 shadow-xl md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  Nature Word Search
                </div>
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
              </div>

              <div className="grid grid-cols-10 gap-1">
                {SAMPLE_GRID.map((row, rowIdx) =>
                  row.map((letter, colIdx) => {
                    const key = `${rowIdx}-${colIdx}`
                    const state = HIGHLIGHTED_CELLS[key]
                    return (
                      <div
                        key={key}
                        className={cn(
                          "grid-letter aspect-square rounded text-[10px] md:text-xs",
                          state === "found" &&
                            "bg-secondary-light text-secondary-foreground",
                          state === "selected" &&
                            "bg-primary text-primary-foreground",
                          !state && "bg-muted/50 text-foreground"
                        )}
                      >
                        {letter}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-secondary" />
                  <span className="truncate">CATS, BIRDS, TREES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-primary" />
                  <span className="truncate">FLOWERS, MOUNTAIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
