"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PuzzleGridProps {
  grid: string[][]
  gridSize: number
  foundCells: Set<string>
  selectedCells: Set<string>
  onCellClick: (row: number, col: number) => void
  onCellHover: (row: number, col: number) => void
  onCellLeave: () => void
  size?: "sm" | "md" | "lg"
}

const sizeConfig: Record<NonNullable<PuzzleGridProps["size"]>, { cell: string; gap: string; padding: string }> = {
  sm: {
    cell: "text-xs sm:text-sm h-6 w-6 sm:h-8 sm:w-8",
    gap: "gap-0",
    padding: "p-2 sm:p-3",
  },
  md: {
    cell: "text-sm sm:text-base h-8 w-8 sm:h-10 sm:w-10",
    gap: "gap-0",
    padding: "p-3 sm:p-4",
  },
  lg: {
    cell: "text-lg sm:text-xl h-10 w-10 sm:h-12 sm:w-12",
    gap: "gap-0",
    padding: "p-4 sm:p-5",
  },
}

export function PuzzleGrid({
  grid,
  gridSize,
  foundCells,
  selectedCells,
  onCellClick,
  onCellHover,
  onCellLeave,
  size = "md",
}: PuzzleGridProps) {
  const config = sizeConfig[size]

  return (
    <div
      className={cn(
        "puzzle-grid inline-block rounded-lg border border-border bg-card shadow-sm select-none",
        config.padding
      )}
      onMouseLeave={onCellLeave}
    >
      <div
        className={cn("grid", config.gap)}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label={`Word search grid ${gridSize} by ${gridSize}`}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const key = `${rowIndex}-${colIndex}`
            const isFound = foundCells.has(key)
            const isSelected = selectedCells.has(key)
            return (
              <div
                key={key}
                role="gridcell"
                className={cn("grid-letter border border-border/50", config.cell, {
                  "found": isFound,
                  "selected": isSelected,
                })}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => onCellHover(rowIndex, colIndex)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  onCellClick(rowIndex, colIndex)
                }}
                onTouchMove={(e) => {
                  e.preventDefault()
                  const touch = e.touches[0]
                  const element = document.elementFromPoint(touch.clientX, touch.clientY)
                  if (element) {
                    const cellKey = element.getAttribute("data-cell-key")
                    if (cellKey) {
                      const [r, c] = cellKey.split("-").map(Number)
                      onCellHover(r, c)
                    }
                  }
                }}
                data-cell-key={key}
              >
                {letter}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
