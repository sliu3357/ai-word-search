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

  // === 移动端长按锁定选词 refs ===
  // 简化策略：长按 150ms 之前，所有触摸 100% 交给浏览器滚动（不 preventDefault）。
  // 长按到期且手指仍按住起点格 → gestureLockedRef=true，之后所有 touchmove 都 preventDefault 锁画面并沿 8 方向选字母。
  const touchStartPtrRef = React.useRef<{ x: number; y: number; t: number } | null>(null)
  // 手势锁定：true 代表本次触摸已进入"拖词模式"
  const gestureLockedRef = React.useRef<boolean>(false)
  // 锁定后按投影计算的 8 方向单位向量，保证拖词路径直线稳定
  const gestureDirRef = React.useRef<{ dr: number; dc: number } | null>(null)
  // 长按计时器 id
  const holdTimerRef = React.useRef<number | null>(null)

  // 视觉反馈：当 holdIndicator = {row, col} 时，这个格子显示"已锁定拖词"的黄色环/轻微放大（用户的心理锚点）
  const [holdIndicator, setHoldIndicator] = React.useState<{ row: number; col: number } | null>(null)

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
   * 移动端触摸拖动：v4 极简策略 — 纯长按锁定（消除方向/速度/scroll 的组合歧义）
   *
   * 之前 v3/v3.1 的问题：方向判定 + 瞬时速度门控 + scroll 变化守门 三个条件互相组合后，
   * "纯水平从左向右"与"纯垂直从上向下"作为歧义轴对齐方向，要么滚动误吞拖词，要么
   * preventDefault 又锁死滚动 — 边界 case 太多（略慢的滚动、略快的拖词、手指抖动、
   * 滚动容器有横向 overflow-x:auto 等）永远调不到头。
   *
   * v4 彻底简化为单一金标准：是否 150ms 长按锁定。
   *  ┌─────────────── 长按 150ms 未到 or 起点没在格子上 ───────────────┐
   *  │  1) 所有 touch 事件 100% 交给浏览器滚动处理                   │
   *  │  2) 不 preventDefault、不修改状态、不清空起点                 │
   *  │  3) 用户能左右滑看后面字母、上下滑看侧栏单词，完全自然       │
   *  └───────────────────────────────────────────────────────────────┘
   *  ┌─────────────── 长按 150ms 到期（仍按住起点格）──────────────────┐
   *  │  1) gestureLockedRef = true，并且视觉上起点格出现黄色环+放大 │
   *  │  2) 之后所有 touchmove：立即 preventDefault、画面不滚动      │
   *  │  3) 从起点到当前指针投影到 8 方向，沿直线选字母，不抖        │
   *  │  4) 抬指：若 ≥2 格 → validatePath 提交答案                  │
   *  └───────────────────────────────────────────────────────────────┘
   *  补充：如果在长按到期前用户移动了 > 24px（明显是要滚，不是要按），就立即取消长按计时器，
   *      这一次手势 100% 交给滚动，避免"想滑却刚好被长按卡住"的体验。
   *
   * 另外点击模式（起点点按、终点点按）完全不受影响，手机上也可以走这条路径。
   */
  React.useEffect(() => {
    const wrap = gridWrapRef.current
    if (!wrap || typeof window === "undefined") return
    if (!("ontouchstart" in window)) return

    const LONG_PRESS_MS = 150
    const CANCEL_HOLD_MOVE_PX = 24   // 长按到期前，如果手移动超过这个像素就取消长按（视为滚动意图）
    const LOCK_ANGLE_TAN = Math.tan((22.5 * Math.PI) / 180) // ≈ 0.414

    const getCellFromTouch = (touch: Touch): { row: number; col: number } | null => {
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!el) return null
      let node: Element | null = el
      for (let i = 0; i < 4 && node; i++) {
        const key = node.getAttribute?.("data-cell-key")
        const r = node.getAttribute?.("data-row")
        const c = node.getAttribute?.("data-col")
        if (key && r != null && c != null) return { row: Number(r), col: Number(c) }
        node = node.parentElement
      }
      return null
    }

    /** 给定位移 (dx,dy) → 8 方向单位向量 (dr,dc)，不属于 8 方向返回 null */
    const classify8Dir = (dx: number, dy: number): { dr: number; dc: number } | null => {
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (absX === 0 && absY === 0) return null
      const dr = dy === 0 ? 0 : dy > 0 ? 1 : -1
      const dc = dx === 0 ? 0 : dx > 0 ? 1 : -1
      if (absX === 0) return { dr, dc: 0 }              // 纯垂直
      if (absY === 0) return { dr: 0, dc }              // 纯水平
      const ratio = absX < absY ? absX / absY : absY / absX
      // 对角线：ratio ∈ [tan22.5°, tan67.5°]
      if (ratio >= LOCK_ANGLE_TAN && ratio <= 1 / LOCK_ANGLE_TAN) return { dr, dc }
      return null
    }

    const clearHoldTimer = () => {
      if (holdTimerRef.current != null) {
        window.clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const t = e.touches[0]
      handleFirstInteraction()
      const cell = getCellFromTouch(t)

      touchStartPtrRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
      gestureLockedRef.current = false
      gestureDirRef.current = null
      clearHoldTimer()
      // 先清掉视觉提示（旧的 hold）
      setHoldIndicator(null)

      if (!cell) {
        // 起点没在格子上 → 全程交给浏览器滚动
        dragStartRef.current = null
        return
      }

      dragStartRef.current = cell
      setSelectStart(cell)
      setHoverCell(cell)
      setWrongPath(null)

      // 启动长按倒计时：150ms 后若还按住就进入"拖词模式"
      const startCell = cell
      holdTimerRef.current = window.setTimeout(() => {
        // 到期：进入锁定态（此时不一定 touchmove 了，手可能还停在原处）
        gestureLockedRef.current = true
        gestureDirRef.current = null       // 方向等第一个 touchmove 再定
        dragStartRef.current = startCell   // 保险再挂一次
        // 视觉锁定提示
        setHoldIndicator(startCell)
        holdTimerRef.current = null
      }, LONG_PRESS_MS)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const t = e.touches[0]
      const startPtr = touchStartPtrRef.current
      const startCell = dragStartRef.current

      // ===== 分支 A：已锁定拖词模式（gestureLockedRef = true） =====
      if (gestureLockedRef.current && startCell) {
        e.preventDefault()
        // 如果方向还没定，用"起点到当前指针的 8 方向投影"取一个方向，然后固定
        if (!gestureDirRef.current) {
          const dx = t.clientX - (startPtr?.x ?? t.clientX)
          const dy = t.clientY - (startPtr?.y ?? t.clientY)
          const dir = classify8Dir(dx, dy)
          if (!dir) {
            // 手还没动出明确方向 → 只 preventDefault 不更新 hover，继续等待
            return
          }
          gestureDirRef.current = dir
        }
        const { dr, dc } = gestureDirRef.current
        const curCell = getCellFromTouch(t) || startCell
        const stepRow = curCell.row - startCell.row
        const stepCol = curCell.col - startCell.col
        const signedStep =
          dr === 0 ? stepCol :
          dc === 0 ? stepRow :
          Math.abs(stepRow) >= Math.abs(stepCol) ? stepRow : stepCol
        const n = Math.max(1, Math.abs(signedStep)) * Math.sign(signedStep || 1)
        setHoverCell({ row: startCell.row + dr * n, col: startCell.col + dc * n })
        return
      }

      // ===== 分支 B：还没进入拖词模式（长按还没到期，或已经是纯滚动） =====
      //   → 全程不 preventDefault，完全交给浏览器滚动
      //   但如果长按计时器还在、并且手移动超过 CANCEL_HOLD_MOVE_PX，就主动取消长按，
      //     避免"本来想滑，刚滑一点点就刚好被长按锁死"。
      if (startPtr && holdTimerRef.current != null) {
        const dx = t.clientX - startPtr.x
        const dy = t.clientY - startPtr.y
        if (Math.hypot(dx, dy) > CANCEL_HOLD_MOVE_PX) {
          clearHoldTimer()
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const locked = gestureLockedRef.current
      const start = dragStartRef.current

      // 清理所有会话状态
      clearHoldTimer()
      gestureLockedRef.current = false
      gestureDirRef.current = null
      touchStartPtrRef.current = null
      dragStartRef.current = null
      setHoldIndicator(null)

      // 没锁定 → 交给 click（点击模式选字母：先点起点、再点终点）
      if (!locked || !start) return

      // 锁定过：抬指时若路径 ≥2 格，提交答案
      if (!hoverCell || (start.row === hoverCell.row && start.col === hoverCell.col)) return
      const path = getLinePath(start.row, start.col, hoverCell.row, hoverCell.col)
      if (path && path.length >= 2) {
        e.preventDefault()
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
      clearHoldTimer()
      wrap.removeEventListener("touchstart", onTouchStart, opts as EventListenerOptions)
      wrap.removeEventListener("touchmove", onTouchMove, opts as EventListenerOptions)
      wrap.removeEventListener("touchend", onTouchEnd, opts as EventListenerOptions)
      wrap.removeEventListener("touchcancel", onTouchEnd, opts as EventListenerOptions)
    }
  }, [hoverCell, validatePath, handleFirstInteraction])

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
              // 策略：manipulation = 允许 pan-x（横向滑动超出屏幕的网格看后面字母）/ pan-y（纵向滚动页面看侧栏的单词），
              // 同时禁用双击缩放（去掉移动端 300ms 点击延迟）。
              // 何时真正拦截滚动：由上方原生 touch 监听的"方向判定 + 动态锁定"精确控制，
              // 只有用户沿 8 个单词方向从某格开始拖拽选字母时，才临时 preventDefault 锁滚动。
              touchAction: "manipulation",
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
                  const isHold = holdIndicator?.row === rowIndex && holdIndicator?.col === colIndex

                  return (
                    <div
                      key={key}
                      role="gridcell"
                      data-cell-key={key}
                      data-row={rowIndex}
                      data-col={colIndex}
                      className={cn(
                        "flex items-center justify-center font-mono font-bold border border-border/40 cursor-pointer transition-all duration-150 ease-out",
                        cellSizeClass,
                        !isFound && !isSelected && !isWrong && !isHold && "hover:bg-[var(--primary-light)]",
                        isHold && !isFound && "bg-amber-200 text-amber-900 ring-2 ring-amber-400 scale-110 shadow-lg z-20",
                        isSelected && !isFound && !isHold && "bg-[var(--primary)] text-white scale-105 z-10",
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
