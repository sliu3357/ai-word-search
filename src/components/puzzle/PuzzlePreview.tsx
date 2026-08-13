"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { PlacedWord } from "@/lib/word-search/types"

interface PuzzlePreviewProps {
  title: string
  grid: string[][]
  gridSize: number
  words: string[]
  placedWords: PlacedWord[]
}

export function PuzzlePreview({
  title,
  grid,
  gridSize,
  words,
  placedWords,
}: PuzzlePreviewProps) {
  const answerCells = React.useMemo(() => {
    const set = new Set<string>()
    for (const word of placedWords) {
      for (const cell of word.cells) {
        set.add(`${cell.row}-${cell.col}`)
      }
    }
    return set
  }, [placedWords])

  /* 打印/导出：精确的单元格像素尺寸，保证A4比例与专业观感 */
  const cellSizeClass = React.useMemo(() => {
    if (gridSize <= 10) return "h-9 w-9 sm:h-10 sm:w-10 text-[18px] sm:text-[20px]"
    if (gridSize <= 15) return "h-8 w-8 sm:h-9 sm:w-9 text-base sm:text-lg"
    if (gridSize <= 20) return "h-7 w-7 sm:h-8 sm:w-8 text-sm sm:text-base"
    return "h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm"
  }, [gridSize])

  const sortedWords = React.useMemo(() => {
    return [...words].sort((a, b) => a.localeCompare(b))
  }, [words])

  return (
    <div
      id="puzzle-export-root"
      className="print-only:block w-full bg-white mx-auto max-w-[794px] p-4 sm:p-6 print:p-0 print:max-w-none"
    >
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 12mm 10mm 12mm;
          }
          html, body {
            background: white !important;
            color: #1f2937 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* 防止导出时任何父级页面样式污染 */
          #puzzle-export-root * {
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* =============================================================
          HEADER / 页眉三行结构
          1) 品牌 Logo + 大标题
          2) Name / Date
          3) 玩法说明
         ============================================================= */}
      <header className="w-full mb-6 sm:mb-7 print:mb-7">
        {/* 第一行：Logo + 大标题 */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* 品牌 Logo：圆角胶囊框 + WordPuzzle.com */}
          <div
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-black/80 px-4 py-1.5 select-none"
            style={{ fontFamily: "var(--font-display), 'Baloo 2', 'Nunito', sans-serif" }}
          >
            <svg
              className="h-4 w-4 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 4 6v6c0 5 3.5 9.3 8 10 4.5-.7 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-sm font-bold tracking-tight text-black whitespace-nowrap">
              WordPuzzle.com
            </span>
          </div>

          {/* 大标题 */}
          <h1
            className="flex-1 text-right text-[32px] sm:text-[40px] print:text-[38px] font-extrabold tracking-tight text-black leading-[1.05]"
            style={{ fontFamily: "var(--font-display), 'Baloo 2', 'Nunito', sans-serif" }}
          >
            {title || "Word Search!"}
          </h1>
        </div>

        {/* 第二行：Name / Date */}
        <div className="flex items-end justify-between gap-8 mb-6 sm:mb-8 text-[13px] sm:text-[14px] text-black/90">
          <div className="flex items-baseline gap-2">
            <span className="font-bold">Name:</span>
            <span className="flex-1 border-b border-black/70 min-w-[180px] sm:min-w-[220px] h-[1px] align-middle" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold">Date:</span>
            <span className="flex-1 border-b border-black/70 min-w-[140px] sm:min-w-[180px] h-[1px] align-middle" />
          </div>
        </div>

        {/* 第三行：玩法说明 — 字体加大、行距扩大、与上方间距加大 */}
        <p className="text-center text-[15px] sm:text-[16px] leading-[1.9] text-black/80 max-w-3xl mx-auto">
          Find and circle each of the words from the list below. Words may appear
          forwards or backwards, horizontally, vertically or diagonally in the grid.
        </p>
      </header>

      {/* =============================================================
          GRID / 字母网格
          单一边框 + 圆角（专业打印风，无内部细网格线）
         ============================================================= */}
      <div className="flex justify-center mb-6 sm:mb-7 print:mb-7">
        <div
          className="inline-block p-2 sm:p-2.5 border border-black/70 rounded-xl bg-white"
          style={{ borderRadius: "14px" }}
        >
          <div
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const key = `${rowIndex}-${colIndex}`
                const isAnswer = answerCells.has(key)
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-center font-mono font-semibold select-none",
                      cellSizeClass,
                      isAnswer ? "print:bg-[#ffe4c0] print:text-[#c2410c]" : ""
                    )}
                    style={{
                      fontFamily: "'Courier New', ui-monospace, monospace",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {letter}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* =============================================================
          WORD LIST / 单词表
          紧凑横向流式排列，无勾选框，无多余标题（参考专业工作表排版）
         ============================================================= */}
      <div className="w-full px-1 sm:px-2 mb-6 sm:mb-7 print:mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px] sm:text-[16.5px] leading-relaxed text-black">
          {sortedWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="inline-block font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display), 'Baloo 2', 'Nunito', sans-serif" }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* =============================================================
          FOOTER / 页脚
          装饰分隔线 + 居中版权
         ============================================================= */}
      <footer className="w-full">
        <div className="mx-auto w-1/2 border-t border-black/30 mb-2" />
        <p className="text-center text-[10.5px] sm:text-[11px] text-black/55 tracking-wide">
          Copyright &copy; {new Date().getFullYear()} WordPuzzle.com &middot; Made for classroom & family fun
        </p>
      </footer>
    </div>
  )
}
