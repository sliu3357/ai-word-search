"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface WordListProps {
  words: string[]
  foundWords: Set<string>
}

export function WordList({ words, foundWords }: WordListProps) {
  return (
    <div className="w-full rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
      <h3 className="mb-4 text-base sm:text-lg font-semibold text-foreground">
        Words to find
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {words.map((word, index) => {
          const isFound = foundWords.has(word)
          return (
            <div
              key={`${word}-${index}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base transition-colors",
                isFound
                  ? "bg-[var(--secondary-light)]"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <svg
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 shrink-0",
                  isFound ? "text-[var(--success)]" : "text-muted-foreground"
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                {isFound ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                )}
              </svg>
              <span
                className={cn(
                  "font-medium font-mono tracking-wide break-all",
                  isFound
                    ? "text-[var(--success)] line-through line-through-decoration-[var(--success)]"
                    : "text-foreground"
                )}
              >
                {word}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span>Found</span>
        <span className="font-semibold">
          <span className="text-[var(--success)]">{foundWords.size}</span>
          <span className="mx-1">/</span>
          <span>{words.length}</span>
        </span>
      </div>
    </div>
  )
}
