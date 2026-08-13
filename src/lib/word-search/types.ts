/** 单词方向选项 */
export type Direction = "horizontal" | "vertical" | "diagonal"

/** 方向模式 */
export type DirectionMode =
  | "orthogonal" // 仅横竖
  | "diagonal" // 横竖+斜向
  | "all" // 全方向（含反向）

/** 大小写选项 */
export type CaseMode = "upper" | "lower"

/** 字体大小选项 */
export type FontSize = "small" | "medium" | "large"

/** 年龄级别 - 适配不同年龄段 */
export type AgeLevel = "preschool" | "early" | "elementary"

/** 纸张大小 */
export type PaperSize = "a4" | "letter"

/** 游戏生成设置 */
export interface PuzzleSettings {
  title?: string
  caseMode: CaseMode
  directionMode: DirectionMode
  includeBackward: boolean
  includeDiagonal: boolean
  gridSize?: number // 自定义网格大小，不传则自动计算
  fontSize: FontSize
  paperSize: PaperSize
  ageLevel?: AgeLevel // 年龄级别，影响网格大小和方向复杂度
}

/** 单词放置信息（答案） */
export interface PlacedWord {
  word: string
  row: number
  col: number
  direction: Direction
  backward: boolean
  cells: { row: number; col: number }[] // 占用的格子坐标
}

/** 生成结果 */
export interface PuzzleResult {
  grid: string[][] // 字母网格
  placedWords: PlacedWord[] // 成功放置的单词
  unplacedWords: string[] // 未能放置的单词
  gridSize: number
  settings: PuzzleSettings
}
