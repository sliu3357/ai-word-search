import type {
  PuzzleSettings,
  PuzzleResult,
  PlacedWord,
  Direction,
  AgeLevel,
} from "./types"

/** 方向向量定义 */
const DIRECTIONS: Record<Direction, [number, number]> = {
  horizontal: [0, 1], // 向右
  vertical: [1, 0], // 向下
  diagonal: [1, 1], // 右下
}

/** 获取可用方向列表 */
function getAvailableDirections(settings: PuzzleSettings): Direction[] {
  if (settings.includeDiagonal) {
    return ["horizontal", "vertical", "diagonal"]
  }
  return ["horizontal", "vertical"]
}

/** 根据单词列表自动计算网格大小，支持年龄级别 */
export function calculateGridSize(words: string[], ageLevel?: AgeLevel): number {
  if (words.length === 0) return 10

  const maxLen = Math.max(...words.map((w) => w.length))

  // 低龄模式：独立计算小网格
  if (ageLevel === "preschool") {
    // 3-4岁：基于最长单词+1，限制 5-8 格
    return Math.min(Math.max(maxLen + 1, 5), 8)
  }

  const avgLen =
    words.reduce((sum, w) => sum + w.length, 0) / words.length
  const totalChars = words.reduce((sum, w) => sum + w.length, 0)

  // 基于经验公式：网格需要足够大以容纳所有单词
  const baseSize = Math.ceil(Math.sqrt(totalChars * avgLen * 1.5))
  const minSize = maxLen + 2 // 至少比最长单词多2格

  const calculated = Math.max(Math.max(baseSize, minSize), 10)

  if (ageLevel === "early") {
    // 5-7岁：限制 8-12 格
    return Math.min(Math.max(calculated, 8), 12)
  }
  // 8+岁：不限制
  return calculated
}

/** 过滤单词：仅保留字母，转大写 */
function processWords(words: string[], caseMode: string): string[] {
  return words
    .map((w) => w.trim().replace(/[^a-zA-Z]/g, "")) // 仅保留字母
    .filter((w) => w.length >= 2 && w.length <= 35) // 2-35字符
    .map((w) => (caseMode === "upper" ? w.toUpperCase() : w.toLowerCase()))
}

/** 随机打乱数组 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 检查单词是否可以放置在指定位置 */
function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i
    const c = col + dc * i

    // 越界检查
    if (r < 0 || r >= size || c < 0 || c >= size) return false

    // 冲突检查：格子已有不同字母
    const existing = grid[r][c]
    if (existing !== null && existing !== word[i]) return false
  }
  return true
}

/** 放置单词到网格 */
function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = []
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i
    const c = col + dc * i
    grid[r][c] = word[i]
    cells.push({ row: r, col: c })
  }
  return cells
}

/** 生成随机字母填充空格 */
function fillEmptyCells(grid: (string | null)[][], size: number): string[][] {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const result: string[][] = []

  for (let r = 0; r < size; r++) {
    result[r] = []
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        result[r][c] = letters[Math.floor(Math.random() * 26)]
      } else {
        result[r][c] = grid[r][c] as string
      }
    }
  }
  return result
}

/**
 * 生成单词搜索游戏
 * 使用回溯算法将单词放置到网格中
 */
export function generateWordSearch(
  rawWords: string[],
  settings: PuzzleSettings
): PuzzleResult {
  // 1. 处理单词列表
  const words = processWords(rawWords, settings.caseMode)

  // 2. 按长度降序排列（长的先放，更容易成功）
  const sortedWords = [...words].sort((a, b) => b.length - a.length)

  // 3. 确定网格大小（根据年龄级别调整）
  const gridSize = settings.gridSize || calculateGridSize(words, settings.ageLevel)

  // 4. 初始化空网格
  const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  )

  const placedWords: PlacedWord[] = []
  const unplacedWords: string[] = []
  const availableDirections = getAvailableDirections(settings)

  // 5. 逐个放置单词
  for (const word of sortedWords) {
    let placed = false
    const maxAttempts = 200 // 每个单词最多尝试200次

    // 尝试随机放置
    const positions = shuffle(
      Array.from({ length: gridSize * gridSize }, (_, i) => ({
        row: Math.floor(i / gridSize),
        col: i % gridSize,
      }))
    )

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const { row, col } = positions[attempt % positions.length]

      // 随机选择方向
      const directions = shuffle(availableDirections)
      for (const dir of directions) {
        const [dr, dc] = DIRECTIONS[dir]

        // 是否反向
        const backwardOptions = settings.includeBackward ? [false, true] : [false]
        for (const backward of shuffle(backwardOptions)) {
          const actualWord = backward ? word.split("").reverse().join("") : word
          const actualDr = backward ? -dr : dr
          const actualDc = backward ? -dc : dc

          if (canPlace(grid, actualWord, row, col, actualDr, actualDc, gridSize)) {
            const cells = placeWord(grid, actualWord, row, col, actualDr, actualDc)
            placedWords.push({
              word: word, // 保存原始单词（非反向版本）
              row,
              col,
              direction: dir,
              backward,
              cells,
            })
            placed = true
            break
          }
        }
        if (placed) break
      }
    }

    if (!placed) {
      unplacedWords.push(word)
    }
  }

  // 6. 填充剩余空格为随机字母
  const finalGrid = fillEmptyCells(grid, gridSize)

  // 7. 大小写转换
  if (settings.caseMode === "lower") {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        finalGrid[r][c] = finalGrid[r][c].toLowerCase()
      }
    }
  }

  return {
    grid: finalGrid,
    placedWords,
    unplacedWords,
    gridSize,
    settings,
  }
}
