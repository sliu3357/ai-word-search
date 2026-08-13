import jsPDF from "jspdf"
import type { PuzzleResult } from "@/lib/word-search/types"

const PAGE_W = 210
const PAGE_H = 297
const MARGIN_X = 14
const MARGIN_TOP = 14
const MARGIN_BOTTOM = 16

export function generatePdf(title: string, result: PuzzleResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const safeTitle = (title || "Word Search!").trim()

  renderPuzzlePage(doc, safeTitle, result)
  doc.addPage("a4", "portrait")
  renderAnswerPage(doc, safeTitle, result)

  const filename = `${safeTitle.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "word_search"}.pdf`
  doc.save(filename)
}

/* ============================================================
   Shared drawing helpers — professional worksheet style
   ============================================================ */

/**
 * 专业 Logo 胶囊：圆角边框 + 盾牌图标标记 + WordPuzzle.com
 * 位置：左上角（与 PuzzlePreview DOM 版本一致）
 */
function drawBrandedLogo(doc: jsPDF, y: number): number {
  const pillW = 50
  const pillH = 8
  const pillX = MARGIN_X
  const pillY = y

  doc.setDrawColor(25, 25, 25)
  doc.setLineWidth(0.5)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pillX, pillY, pillW, pillH, pillH / 2, pillH / 2, "FD")

  /* Shield icon (left of text) */
  const icX = pillX + 4.2
  const icY = pillY + pillH / 2
  doc.setDrawColor(20, 20, 20)
  doc.setLineWidth(0.35)
  doc.setFillColor(20, 20, 20)
  /* 简化的盾牌 */
  doc.circle(icX, icY - 0.6, 2.2, "F")
  doc.setFillColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text("✓", icX, icY - 0.3, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(20, 20, 20)
  doc.text("WordPuzzle.com", pillX + 14, pillY + pillH / 2 + 1.2, {
    align: "left",
  })

  return pillY + pillH
}

/**
 * 大标题（第一行右侧）—— 和 PuzzlePreview 一致：右对齐、超大、粗体
 */
function drawHeroTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.setTextColor(12, 12, 12)

  const maxWidth = PAGE_W - MARGIN_X * 2 - 56 /* logo width + gap */
  const lines = doc.splitTextToSize(title, maxWidth)
  doc.text(lines, PAGE_W - MARGIN_X, y + 3, { align: "right" })
  return y + Math.max(lines.length * 10, 10)
}

/**
 * Name / Date 行：左 Name、右 Date，用细下划线（参考图1）
 */
function drawNameDateRow(doc: jsPDF, y: number): number {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11.5)
  doc.setTextColor(15, 15, 15)

  const labelY = y + 4.2
  const underlineY = labelY + 0.8

  /* Name 标签 + 下划线 */
  const nameLabel = "Name:"
  doc.text(nameLabel, MARGIN_X, labelY)
  const nameLabelW = doc.getTextWidth(nameLabel) + 2
  const nameStart = MARGIN_X + nameLabelW
  const nameEnd = MARGIN_X + 100
  doc.setDrawColor(50, 50, 50)
  doc.setLineWidth(0.25)
  doc.line(nameStart, underlineY, nameEnd, underlineY)

  /* Date 标签 + 下划线 */
  const dateLabel = "Date:"
  const dateLabelW = doc.getTextWidth(dateLabel) + 2
  const dateEnd = PAGE_W - MARGIN_X
  const dateStart = dateEnd - 60
  doc.text(dateLabel, dateStart - dateLabelW, labelY)
  doc.line(dateStart, underlineY, dateEnd, underlineY)

  return y + 7.5
}

/**
 * 玩法说明：纯文本居中两行（避免 emoji 乱码）
 * - 字体加大到 12pt
 * - 行距扩大到 6.5mm
 * - 与上方 Name/Date 行间距加大
 */
function drawInstructions(doc: jsPDF, y: number): number {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(50, 50, 50)
  const text =
    "Find and circle each of the words from the list below. Words may appear forwards or backwards, horizontally, vertically or diagonally in the grid."
  const lines = doc.splitTextToSize(text, PAGE_W - MARGIN_X * 2)
  const lineH = 6.5 /* 行距 mm */
  let cursorY = y + 2 /* 与上一行间距 */
  for (const line of lines) {
    doc.text(line, PAGE_W / 2, cursorY, { align: "center" })
    cursorY += lineH
  }
  return cursorY + 4
}

/**
 * 只有外框、无内部细线的网格外边框
 */
function drawGridOuterFrame(
  doc: jsPDF,
  gridX: number,
  gridY: number,
  gridTotalW: number,
  gridTotalH: number,
): void {
  const radius = Math.min(3, gridTotalW * 0.025)
  doc.setDrawColor(40, 40, 40)
  doc.setLineWidth(0.6)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(gridX - 1.5, gridY - 1.5, gridTotalW + 3, gridTotalH + 3, radius, radius, "FD")
}

/**
 * 只有外框、无内部细线的字母网格（参考 WorksheetWorks 风格）
 */
function drawGridLetters(
  doc: jsPDF,
  grid: string[][],
  gridSize: number,
  gridX: number,
  gridY: number,
  cell: number,
  fontSize: number,
): void {
  doc.setFont("courier", "bold")
  doc.setFontSize(fontSize)
  doc.setTextColor(12, 12, 12)

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = gridX + c * cell
      const y = gridY + r * cell
      const letter = (grid[r][c] ?? "").toUpperCase()
      doc.text(letter, x + cell / 2, y + cell / 2 + fontSize * 0.3, {
        align: "center",
      })
    }
  }
}

/**
 * 紧凑横向单词流（参考 WorksheetWorks）
 * 所有单词一行或两行居中排布，间距一致，无勾选框
 */
function drawWordFlow(
  doc: jsPDF,
  words: string[],
  y: number,
): number {
  const sorted = [...words].sort((a, b) => a.localeCompare(b))
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13.5)
  doc.setTextColor(15, 15, 15)

  const maxWidth = PAGE_W - MARGIN_X * 2
  const gap = 6.5 /* 单词之间的间距 */
  const lineH = 7
  const startX = MARGIN_X
  const endX = PAGE_W - MARGIN_X

  const lines: string[] = []
  let current = ""
  let currentW = 0

  for (let i = 0; i < sorted.length; i++) {
    const w = sorted[i]
    const wW = doc.getTextWidth(w)
    const needW = currentW === 0 ? wW : currentW + gap + wW

    if (needW <= maxWidth) {
      current = current === "" ? w : current + " ".repeat(4) + w
      currentW = needW
    } else {
      lines.push(current)
      current = w
      currentW = wW
    }
  }
  if (current !== "") lines.push(current)

  let rowY = y
  for (const line of lines) {
    /* 手动计算每个单词的位置，居中分布 */
    const wordsInLine: { word: string; x: number }[] = []
    /* 重新按 gap 计算 total width */
    const pieces = line.split(/\s{4,}/).filter(Boolean)
    let totalW = 0
    const widths: number[] = []
    for (const w of pieces) {
      const ww = doc.getTextWidth(w)
      widths.push(ww)
      totalW += ww
    }
    if (pieces.length > 1) totalW += (pieces.length - 1) * gap

    let cursorX = startX + (maxWidth - totalW) / 2
    for (let i = 0; i < pieces.length; i++) {
      wordsInLine.push({ word: pieces[i], x: cursorX })
      cursorX += widths[i] + gap
    }

    for (const { word, x } of wordsInLine) {
      doc.text(word, x, rowY + lineH - 1.2)
    }
    rowY += lineH
  }

  return rowY + 3
}

/**
 * 页脚：装饰半宽线 + 居中版权
 */
function drawBrandedFooter(doc: jsPDF, extra: string): void {
  const center = PAGE_W / 2
  const lineY = PAGE_H - MARGIN_BOTTOM - 3
  const half = 30
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.2)
  doc.line(center - half, lineY, center + half, lineY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(110, 110, 110)
  const year = new Date().getFullYear()
  const text = `Copyright \u00A9 ${year} WordPuzzle.com  \u00B7  ${extra}`
  doc.text(text, center, lineY + 4.2, { align: "center" })
}

/* ============================================================
   Page 1: Puzzle
   ============================================================ */

function renderPuzzlePage(doc: jsPDF, title: string, result: PuzzleResult): void {
  let cursorY = MARGIN_TOP

  /* Header row 1: Logo + Hero Title */
  const logoEndY = drawBrandedLogo(doc, cursorY)
  cursorY = Math.max(logoEndY, cursorY)
  cursorY = drawHeroTitle(doc, title, cursorY)
  cursorY += 2

  /* Header row 2: Name / Date */
  cursorY = drawNameDateRow(doc, cursorY)
  cursorY += 1

  /* Header row 3: Instructions */
  cursorY = drawInstructions(doc, cursorY)
  cursorY += 1.5

  /* Grid */
  const gridSize = result.gridSize
  const grid = result.grid

  const availableW = PAGE_W - MARGIN_X * 2
  const availableH = 100 /* 48% A4 高 ~ 142, 控制在 100 内让底部单词有空间 */
  const cell = Math.min(availableW / gridSize, availableH / gridSize, 9.5)
  const gridTotalW = cell * gridSize
  const gridTotalH = gridTotalW
  const gridX = (PAGE_W - gridTotalW) / 2
  const gridY = cursorY

  drawGridOuterFrame(doc, gridX, gridY, gridTotalW, gridTotalH)

  const fontSize = cell >= 7.5 ? 14 : cell >= 5.5 ? 12 : 10
  drawGridLetters(doc, grid, gridSize, gridX, gridY, cell, fontSize)

  cursorY = gridY + gridTotalH + 7

  /* Word list (compact flow) */
  const words = result.placedWords.map((w) => w.word)
  cursorY = drawWordFlow(doc, words, cursorY)

  /* Footer */
  drawBrandedFooter(doc, result.placedWords.length + " words \u00B7 made for classroom & home")
}

/* ============================================================
   Page 2: Answer Key
   ============================================================ */

function renderAnswerPage(doc: jsPDF, title: string, result: PuzzleResult): void {
  let cursorY = MARGIN_TOP

  /* Header row 1: Logo + ANSWER KEY title */
  const logoEndY = drawBrandedLogo(doc, cursorY)
  cursorY = Math.max(logoEndY, cursorY)

  /* Right-aligned ANSWER KEY */
  doc.setFont("helvetica", "bold")
  doc.setFontSize(26)
  doc.setTextColor(12, 12, 12)
  doc.text("ANSWER KEY", PAGE_W - MARGIN_X, cursorY + 2.5, { align: "right" })
  cursorY += 9

  /* Subtitle: puzzle title */
  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.setTextColor(90, 90, 90)
  doc.text(title, PAGE_W - MARGIN_X, cursorY + 2, { align: "right" })
  cursorY += 7

  /* Instructions */
  cursorY = drawInstructions(doc, cursorY)
  cursorY += 1

  /* Grid */
  const gridSize = result.gridSize
  const grid = result.grid

  const availableW = PAGE_W - MARGIN_X * 2
  const availableH = 100
  const cell = Math.min(availableW / gridSize, availableH / gridSize, 9)
  const gridTotalW = cell * gridSize
  const gridTotalH = gridTotalW
  const gridX = (PAGE_W - gridTotalW) / 2
  const gridY = cursorY

  drawGridOuterFrame(doc, gridX, gridY, gridTotalW, gridTotalH)

  /* Highlight ovals first (below letters) */
  drawHighlightOvals(doc, result, gridX, gridY, cell)

  const fontSize = cell >= 7.5 ? 13.5 : cell >= 5.5 ? 11.5 : 9.5
  drawGridLetters(doc, grid, gridSize, gridX, gridY, cell, fontSize)

  cursorY = gridY + gridTotalH + 7

  /* Word list */
  const words = result.placedWords.map((w) => w.word)
  cursorY = drawWordFlow(doc, words, cursorY)

  /* Footer */
  drawBrandedFooter(doc, "Answer Key \u00B7 " + result.placedWords.length + " words")
}

function drawHighlightOvals(
  doc: jsPDF,
  result: PuzzleResult,
  gridX: number,
  gridY: number,
  cell: number,
): void {
  result.placedWords.forEach((pw) => {
    const cells = pw.cells
    if (cells.length === 0) return

    let minR = cells[0].row
    let maxR = cells[0].row
    let minC = cells[0].col
    let maxC = cells[0].col

    for (const c of cells) {
      if (c.row < minR) minR = c.row
      if (c.row > maxR) maxR = c.row
      if (c.col < minC) minC = c.col
      if (c.col > maxC) maxC = c.col
    }

    const left = gridX + minC * cell
    const top = gridY + minR * cell
    const right = gridX + (maxC + 1) * cell
    const bottom = gridY + (maxR + 1) * cell

    const cx = (left + right) / 2
    const cy = (top + bottom) / 2
    const rx = (right - left) / 2 + cell * 0.2
    const ry = (bottom - top) / 2 + cell * 0.2

    doc.setFillColor(255, 228, 192)
    doc.ellipse(cx, cy, rx, ry, "F")

    doc.setDrawColor(210, 120, 50)
    doc.setLineWidth(0.35)
    doc.ellipse(cx, cy, rx, ry, "S")
  })
}
