"use client"

import * as React from "react"
import { CheckCircle2, RefreshCw, Trophy, Maximize2, Minimize2, X, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { PlacedWord } from "@/lib/word-search/types"

/* 每个找到的单词分配一种颜色（背景 + 文字 */
const WORD_COLORS = [
  { bg: "#A7E8C6", text: "#0F6B47", ring: "#5BC490" }, // 青绿
  { bg: "#FFD8A8", text: "#B5651D", ring: "#F0A060" }, // 橙
  { bg: "#FFE9A8", text: "#9A6B00", ring: "#F0C040" }, // 黄
  { bg: "#B4D4FF", text: "#1E4FB0", ring: "#6FA0F0" }, // 蓝
  { bg: "#F4A6CD", text: "#9B2C6B", ring: "#E070A8" }, // 粉
  { bg: "#C4B5FD", text: "#553C9A", ring: "#9890F0" }, // 紫
  { bg: "#FCA5A5", text: "#B91C1C", ring: "#F07070" }, // 红
  { bg: "#6EE7B7", text: "#047857", ring: "#40C090" }, // 绿
]

/* === 胜利音效（Web Audio API，无需音频文件） === */
function playVictorySound() {
  if (typeof window === "undefined") return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()

    // C5-E5-G5-C6 上升胜利音阶
    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 },
      { freq: 659.25, time: 0.12, dur: 0.12 },
      { freq: 783.99, time: 0.24, dur: 0.12 },
      { freq: 1046.5, time: 0.36, dur: 0.3 },
    ]

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + time)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + time)
      osc.stop(ctx.currentTime + time + dur)
    })

    // 4 秒后关闭 ctx
    setTimeout(() => ctx.close(), 4000)
  } catch (err) {
    console.error("Audio playback failed:", err)
  }
}

/* === 五彩纸屑粒子 === */
const CONFETTI_COLORS = ["#FFD8A8", "#A7E8C6", "#B4D4FF", "#F4A6CD", "#FFE9A8", "#C4B5FD"]
const CONFETTI_COUNT = 60

// 预计算的伪随机参数（固定值，避免 render/effect 中调用 Math.random）
const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
  // 用简单的伪随机公式生成确定值
  const r = (n: number) => {
    const x = Math.sin(i * 99.13 + n * 17.71) * 10000
    return x - Math.floor(x)
  }
  return {
    id: i,
    left: r(1) * 100,
    delay: r(2) * 0.5,
    duration: 1.8 + r(3) * 1.2,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + r(4) * 8,
    rotation: r(5) * 360,
    drift: (r(6) - 0.5) * 120,
  }
})

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
      {CONFETTI_PIECES.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift)) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

/* === 胜利弹窗 === */
function VictoryModal({
  onClose,
  onPlayAgain,
}: {
  onClose: () => void
  onPlayAgain: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 半透明遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-[pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
      >
        {/* 顶部渐变背景 */}
        <div className="relative bg-gradient-to-br from-[#FFD8A8] via-[#FFE9A8] to-[#A7E8C6] px-6 pt-10 pb-8 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-foreground/60 transition-colors hover:bg-white/40 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 奖杯图标（带弹跳动画） */}
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg animate-[bounce-in_0.6s_0.2s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <Trophy className="h-10 w-10 text-[#B5651D]" />
          </div>

          <h2 id="victory-title" className="text-2xl font-bold text-[#0F6B47]">
            Congratulations!
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground/70">
            You found all the words!
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-foreground/15 hover:bg-foreground/5"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 rounded-xl bg-secondary text-white hover:bg-secondary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

interface InteractivePuzzleProps {
  grid: string[][]
  gridSize: number
  placedWords: PlacedWord[]
  title?: string
  puzzleId?: string // 保存游戏记录用
}

interface FoundWordInfo {
  word: string
  colorIndex: number
  cells: { row: number; col: number }[]
}

/** 计算从起点到终点的直线路径，仅水平/垂直/对角线有效 */
function getLinePath(r1: number, c1: number, r2: number, c2: number) {
  const dr = r2 - r1
  const dc = c2 - c1
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
    return null
  }
  const steps = Math.max(Math.abs(dr), Math.abs(dc))
  if (steps === 0) return [{ row: r1, col: c1 }]
  const sr = dr === 0 ? 0 : dr / Math.abs(dr)
  const sc = dc === 0 ? 0 : dc / Math.abs(dc)
  const path: { row: number; col: number }[] = []
  for (let i = 0; i <= steps; i++) {
    path.push({ row: r1 + sr * i, col: c1 + sc * i })
  }
  return path
}

export function InteractivePuzzle({
  grid,
  gridSize,
  placedWords,
  title,
  puzzleId,
}: InteractivePuzzleProps) {
  // 选中的起点（点击模式或拖拽模式共用）
  const [selectStart, setSelectStart] = React.useState<{ row: number; col: number } | null>(null)
  // 当前悬停的格子（用于预览路径）
  const [hoverCell, setHoverCell] = React.useState<{ row: number; col: number } | null>(null)
  // 已找到的单词列表
  const [foundWords, setFoundWords] = React.useState<FoundWordInfo[]>([])
  // 刚刚找到的反馈（用于动画）
  const [justFound, setJustFound] = React.useState<string | null>(null)
  // 错误反馈
  const [wrongPath, setWrongPath] = React.useState<{ row: number; col: number }[] | null>(null)
  // 全屏模式
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  // 胜利弹窗显示
  const [showVictory, setShowVictory] = React.useState(false)
  // 上一次的完成数（用于判断是否刚刚达成全找到）
  const prevAllFoundRef = React.useRef(false)
  // 游戏开始时间
  const startTimeRef = React.useRef<number | null>(null)
  // 是否已保存记录（避免重复保存）
  const savedRef = React.useRef(false)

  // ESC 退出全屏 / 关闭弹窗
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showVictory) setShowVictory(false)
        else if (isFullscreen) setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isFullscreen, showVictory])

  // 全屏时锁定 body 滚动
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isFullscreen])

  // 拖拽状态（ref 避免重渲染）
  const dragStartRef = React.useRef<{ row: number; col: number } | null>(null)
  // 标记刚完成拖拽（避免触发后续 click）
  const justDraggedRef = React.useRef(false)
  // 网格容器 ref：用于注册原生触摸事件、防止移动端页面滚动/下拉
  const gridWrapRef = React.useRef<HTMLDivElement | null>(null)

  // 找到的单词 -> 颜色索引 映射
  const foundWordMap = React.useMemo(() => {
    const m = new Map<string, FoundWordInfo>()
    for (const f of foundWords) m.set(f.word, f)
    return m
  }, [foundWords])

  // 每个格子分配的颜色索引（找到的格子）
  const cellColorMap = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const f of foundWords) {
      for (const c of f.cells) {
        m.set(`${c.row}-${c.col}`, f.colorIndex)
      }
    }
    return m
  }, [foundWords])

  // 当前选中路径（预览）
  const currentPath = React.useMemo(() => {
    if (!selectStart || !hoverCell) return []
    const path = getLinePath(selectStart.row, selectStart.col, hoverCell.row, hoverCell.col)
    return path ?? [selectStart]
  }, [selectStart, hoverCell])

  const currentPathSet = React.useMemo(() => {
    const s = new Set<string>()
    for (const p of currentPath) s.add(`${p.row}-${p.col}`)
    return s
  }, [currentPath])

  const wrongPathSet = React.useMemo(() => {
    if (!wrongPath) return new Set<string>()
    return new Set(wrongPath.map((p) => `${p.row}-${p.col}`))
  }, [wrongPath])

  // 可查找的单词列表（已放置的）
  const words = React.useMemo(
    () => placedWords.map((p) => p.word),
    [placedWords]
  )

  const allFound = foundWords.length === words.length && words.length > 0

  // 检测首次达到 allFound：触发胜利弹窗 + 音效 + 保存记录
  React.useEffect(() => {
    if (allFound && !prevAllFoundRef.current) {
      setShowVictory(true)
      playVictorySound()

      // 保存游戏记录到服务器
      if (puzzleId && !savedRef.current) {
        savedRef.current = true
        const durationSec = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current) / 1000)
          : null

        fetch("/api/game/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            puzzleId,
            foundWords: foundWords.map((f) => f.word),
            completed: true,
            durationSec,
          }),
        }).catch((err) => console.error("[game/save] Failed:", err))
      }
    }
    prevAllFoundRef.current = allFound
  }, [allFound, puzzleId, foundWords])

  // 记录首次交互时间作为游戏开始时间
  const handleFirstInteraction = React.useCallback(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
  }, [])

  // 验证路径上的字母是否匹配某个单词
  const validatePath = React.useCallback((path: { row: number; col: number }[]) => {
    if (!path || path.length < 2) {
      setSelectStart(null)
      setHoverCell(null)
      return
    }

    const letters = path.map((p) => grid[p.row]?.[p.col]).filter(Boolean).join("")
    const reversed = letters.split("").reverse().join("")

    const matched = placedWords.find((pw) => {
      if (foundWordMap.has(pw.word)) return false
      return pw.word.toUpperCase() === letters.toUpperCase() || pw.word.toUpperCase() === reversed.toUpperCase()
    })

    if (matched) {
      const colorIndex = foundWords.length % WORD_COLORS.length
      setFoundWords((prev) => [
        ...prev,
        { word: matched.word, colorIndex, cells: path },
      ])
      setJustFound(matched.word)
      setTimeout(() => setJustFound(null), 1200)
    } else {
      setWrongPath(path)
      setTimeout(() => setWrongPath(null), 500)
    }

    setSelectStart(null)
    setHoverCell(null)
  }, [grid, placedWords, foundWordMap, foundWords.length])

  /* === 点击模式 === */
  // 第一次点击设起点，第二次点击设终点并验证
  const handleCellClick = (row: number, col: number) => {
    if (allFound) return
    handleFirstInteraction()
    // 如果刚完成拖拽，跳过这次 click（mousedown→mouseup→click 序列中的 click）
    if (justDraggedRef.current) {
      justDraggedRef.current = false
      return
    }

    // 第一次点击：设起点
    if (!selectStart) {
      setSelectStart({ row, col })
      setHoverCell({ row, col })
      setWrongPath(null)
      return
    }

    // 点击同一个格子：取消选择
    if (selectStart.row === row && selectStart.col === col) {
      setSelectStart(null)
      setHoverCell(null)
      return
    }

    // 第二次点击：计算路径并验证
    const path = getLinePath(selectStart.row, selectStart.col, row, col)
    if (!path || path.length < 2) {
      // 不是有效直线，重新设为起点
      setSelectStart({ row, col })
      setHoverCell({ row, col })
      return
    }

    validatePath(path)
  }

  /* === 拖拽模式（桌面增强）=== */
  const handleCellMouseDown = (row: number, col: number) => {
    if (allFound) return
    handleFirstInteraction()
    dragStartRef.current = { row, col }
    setSelectStart({ row, col })
    setHoverCell({ row, col })
    setWrongPath(null)
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    // 拖拽中或已选起点时，更新预览路径
    if (dragStartRef.current || selectStart) {
      setHoverCell({ row, col })
    }
  }

  // 全局 mouseup 处理拖拽结束
  React.useEffect(() => {
    const handleMouseUp = () => {
      if (!dragStartRef.current) return

      const start = dragStartRef.current
      dragStartRef.current = null

      // 如果起点和终点相同，视为点击（不验证，交给 click 处理）
      if (!hoverCell || (start.row === hoverCell.row && start.col === hoverCell.col)) {
        return
      }

      const path = getLinePath(start.row, start.col, hoverCell.row, hoverCell.col)
      if (path && path.length >= 2) {
        justDraggedRef.current = true
        validatePath(path)
      }
    }

    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [hoverCell, validatePath])

  /**
   * 移动端触摸拖动：原生事件绑定（passive:false + preventDefault）
   * —— React 合成事件 onTouchMove 默认 passive:true，e.preventDefault() 无效，
   *    会导致手指拖动选字母时整个页面跟着滚动/橡皮筋下拉。
   * 这里在网格容器 DOM 上直接注册原生监听器，双重防御：
   *  1) CSS touch-action: none / user-select: none（声明性优先）
   *  2) 原生 touchmove 中显式 preventDefault，彻底拦截滚动。
   */
  React.useEffect(() => {
    const wrap = gridWrapRef.current
    if (!wrap || typeof window === "undefined") return
    if (!("ontouchstart" in window)) return

    const getCellFromTouch = (touch: Touch): { row: number; col: number } | null => {
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!el) return null
      let node: Element | null = el
      for (let i = 0; i < 4 && node; i++) {
        const key = node.getAttribute?.("data-cell-key")
        const r = node.getAttribute?.("data-row")
        const c = node.getAttribute?.("data-col")
        if (key && r != null && c != null) {
          return { row: Number(r), col: Number(c) }
        }
        node = node.parentElement
      }
      return null
    }

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return
      e.preventDefault()
      handleFirstInteraction()
      const cell = getCellFromTouch(e.touches[0])
      if (!cell) return
      dragStartRef.current = cell
      setSelectStart(cell)
      setHoverCell(cell)
      setWrongPath(null)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current && !selectStart) return
      if (!e.touches[0]) return
      // 核心：真正阻止浏览器把拖动识别成 page 滚动 / 橡皮筋下拉
      e.preventDefault()
      const cell = getCellFromTouch(e.touches[0])
      if (cell) setHoverCell(cell)
    }

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!dragStartRef.current) return
      const start = dragStartRef.current
      dragStartRef.current = null
      if (!hoverCell || (start.row === hoverCell.row && start.col === hoverCell.col)) {
        // 单格触摸：点击模式（后续由 click 处理起点/终点）
        return
      }
      const path = getLinePath(start.row, start.col, hoverCell.row, hoverCell.col)
      if (path && path.length >= 2) {
        justDraggedRef.current = true
        validatePath(path)
      }
    }

    const opts: AddEventListenerOptions = { passive: false, capture: false }
    wrap.addEventListener("touchstart", onTouchStart, opts)
    wrap.addEventListener("touchmove", onTouchMove, opts)
    wrap.addEventListener("touchend", onTouchEnd, opts)
    wrap.addEventListener("touchcancel", onTouchEnd, opts)

    return () => {
      wrap.removeEventListener("touchstart", onTouchStart, opts as EventListenerOptions)
      wrap.removeEventListener("touchmove", onTouchMove, opts as EventListenerOptions)
      wrap.removeEventListener("touchend", onTouchEnd, opts as EventListenerOptions)
      wrap.removeEventListener("touchcancel", onTouchEnd, opts as EventListenerOptions)
    }
  }, [hoverCell, selectStart, validatePath, handleFirstInteraction])

  const handleReset = () => {
    setFoundWords([])
    setSelectStart(null)
    setHoverCell(null)
    setJustFound(null)
    setWrongPath(null)
    setShowVictory(false)
    prevAllFoundRef.current = false
    dragStartRef.current = null
    startTimeRef.current = null
    savedRef.current = false
  }

  // 格子尺寸 - 全屏时更大
  const cellSizeClass = React.useMemo(() => {
    if (isFullscreen) {
      if (gridSize <= 8) return "text-2xl sm:text-4xl h-14 w-14 sm:h-20 sm:w-20"
      if (gridSize <= 12) return "text-xl sm:text-3xl h-12 w-12 sm:h-16 sm:w-16"
      if (gridSize <= 15) return "text-lg sm:text-2xl h-10 w-10 sm:h-14 sm:w-14"
      return "text-base sm:text-xl h-9 w-9 sm:h-12 sm:w-12"
    }
    if (gridSize <= 8) return "text-lg sm:text-xl h-11 w-11 sm:h-12 sm:w-12"
    if (gridSize <= 10) return "text-base sm:text-lg h-9 w-9 sm:h-10 sm:w-10"
    if (gridSize <= 15) return "text-sm sm:text-base h-8 w-8 sm:h-9 sm:w-9"
    if (gridSize <= 20) return "text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-8"
    return "text-xs h-6 w-6 sm:h-7 sm:w-7"
  }, [gridSize, isFullscreen])

  return (
    <div className={cn("space-y-5", isFullscreen && "fixed inset-0 z-[9999] bg-[#FAF8F2] p-4 sm:p-6 overflow-y-auto")}>
      {/* 顶部状态栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {title || "Play Online"}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click a start and end letter, or drag to connect letters and find words.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-[var(--mint)] px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm font-bold text-foreground">
              {foundWords.length}
              <span className="text-muted-foreground mx-1">/</span>
              {words.length}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-full"
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--hill)] to-[var(--secondary)] transition-all duration-500"
          style={{
            width: `${words.length > 0 ? (foundWords.length / words.length) * 100 : 0}%`,
          }}
        />
      </div>

      <div className={cn("grid gap-5", isFullscreen ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[1fr_280px]")}>
        {/* 游戏网格 */}
        <div className="flex justify-center overflow-x-auto py-2">
          <div
            ref={gridWrapRef}
            className="inline-block p-3 sm:p-4 rounded-2xl border-2 border-border bg-card shadow-sm select-none"
            style={{
              // 关键 CSS：声明性地告诉移动端浏览器，本区域的触摸手势不要翻译成滚动/缩放/橡皮筋下拉
              touchAction: "none",
              // 防止长按弹出系统菜单、阻止文字选中
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
            }}
            onMouseLeave={() => {
              if (!dragStartRef.current && !selectStart) setHoverCell(null)
            }}
          >
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
              role="grid"
              aria-label="Interactive word search grid"
            >
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`
                  const colorIdx = cellColorMap.get(key)
                  const isSelected = currentPathSet.has(key)
                  const isWrong = wrongPathSet.has(key)
                  const isFound = colorIdx !== undefined
                  const color = isFound ? WORD_COLORS[colorIdx!] : null
                  const isStart = selectStart?.row === rowIndex && selectStart?.col === colIndex

                  return (
                    <div
                      key={key}
                      role="gridcell"
                      data-cell-key={key}
                      data-row={rowIndex}
                      data-col={colIndex}
                      className={cn(
                        "flex items-center justify-center font-mono font-bold border border-border/40 cursor-pointer transition-colors duration-150",
                        cellSizeClass,
                        !isFound && !isSelected && !isWrong && "hover:bg-[var(--primary-light)]",
                        isSelected && !isFound && "bg-[var(--primary)] text-white scale-105 z-10",
                        isWrong && "bg-red-200 text-red-700",
                        isFound && "scale-100"
                      )}
                      style={
                        isFound && color
                          ? {
                              backgroundColor: color.bg,
                              color: color.text,
                              boxShadow: `inset 0 0 0 2px ${color.ring}`,
                            }
                          : undefined
                      }
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    >
                      {letter}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* 右侧单词列表 */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-foreground uppercase tracking-wide">
            Find These Words
          </h4>
          <div className="space-y-2">
            {words.map((word, idx) => {
              const found = foundWordMap.get(word)
              const isFound = !!found
              const color = isFound ? WORD_COLORS[found!.colorIndex] : null
              return (
                <div
                  key={`${word}-${idx}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono font-semibold transition-all",
                    isFound ? "line-through opacity-90" : "bg-muted/50"
                  )}
                  style={
                    isFound && color
                      ? { backgroundColor: color.bg, color: color.text }
                      : undefined
                  }
                >
                  <span className="flex-1 break-all">{word}</span>
                  {isFound && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* 刚找到的反馈 */}
          {justFound && (
            <div className="mt-3 rounded-lg bg-[var(--mint)] px-3 py-2 text-center text-sm font-bold text-[var(--success)] animate-pulse">
              Found &quot;{justFound}&quot;!
            </div>
          )}

          {/* 全部完成的迷你提示（侧栏，弹窗为主） */}
          {allFound && (
            <div className="mt-4 rounded-xl bg-gradient-to-br from-[var(--sun)] to-[var(--accent)] p-4 text-center text-white shadow-lg">
              <Trophy className="mx-auto h-8 w-8 mb-2" />
              <div className="font-bold text-base">All Found!</div>
              <div className="text-xs opacity-90 mt-1">Great job, explorer!</div>
            </div>
          )}
        </div>
      </div>

      {/* 胜利弹窗 + 五彩纸屑 */}
      {showVictory && allFound && (
        <>
          <Confetti />
          <VictoryModal
            onClose={() => setShowVictory(false)}
            onPlayAgain={handleReset}
          />
        </>
      )}
    </div>
  )
}
