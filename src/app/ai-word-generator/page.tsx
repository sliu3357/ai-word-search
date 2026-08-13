"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Sparkles,
  Mic,
  MicOff,
  Loader,
  AlertCircle,
  Lightbulb,
  Wand2,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Pencil,
  Download,
} from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Difficulty } from "@/lib/ai/word-generator"

/* ---------------------------------------------------------------------
   Static config
   --------------------------------------------------------------------- */

type DifficultyConfig = {
  value: Difficulty
  emoji: string
  tagline: string
  description: string
  accent: string
  ring: string
  text: string
}

const DIFFICULTIES: DifficultyConfig[] = [
  {
    value: "easy",
    emoji: "🌱",
    tagline: "Easy · Little Kids",
    description: "Short words (2–6 letters), 5–8 words. Horizontal & vertical only.",
    accent: "bg-[var(--cream)]",
    ring: "ring-emerald-300",
    text: "text-emerald-700",
  },
  {
    value: "medium",
    emoji: "🌻",
    tagline: "Medium · Grades 1–2",
    description: "Everyday words (3–9 letters), 8–12 words. Includes diagonals.",
    accent: "bg-[var(--mint)]",
    ring: "ring-teal-300",
    text: "text-teal-700",
  },
  {
    value: "hard",
    emoji: "🚀",
    tagline: "Hard · Grades 3–4",
    description: "Rich vocabulary (4–14 letters), 10–15 words. All directions.",
    accent: "bg-[var(--peach)]",
    ring: "ring-orange-300",
    text: "text-orange-700",
  },
]

const SAMPLE_SCENES: { label: string; scene: string; emoji: string }[] = [
  { label: "A day at the beach", emoji: "🏖️", scene: "a sunny day at the beach with sand castles and waves" },
  { label: "Outer space", emoji: "🚀", scene: "astronauts exploring outer space and visiting Mars" },
  { label: "Birthday party", emoji: "🎂", scene: "a kids birthday party with cake, balloons and games" },
  { label: "Forest walk", emoji: "🌲", scene: "walking through a green forest with animals and trees" },
  { label: "Community helpers", emoji: "🚒", scene: "community helpers: doctors, firefighters and teachers" },
  { label: "Cooking with mom", emoji: "🍳", scene: "cooking and baking in the kitchen with family" },
]

const DIFFICULTY_TO_WORD_SET: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

interface ApiSuccess {
  ok: true
  title: string
  words: string[]
  difficulty: Difficulty
  engine: "llm" | "rule"
  remainingCredits?: number | "unlimited" | null
}

interface ApiError {
  ok: false
  error: string
  code?: string
}

type ApiResp = ApiSuccess | ApiError

/* ---------------------------------------------------------------------
   Page entry
   --------------------------------------------------------------------- */

export default function AiWordGeneratorPage() {
  return (
    <PageLayout>
      <AiWordGeneratorContent />
    </PageLayout>
  )
}

/* ---------------------------------------------------------------------
   Main content
   --------------------------------------------------------------------- */

function AiWordGeneratorContent() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()

  // ---- input state ----------------------------------------------------
  const [scene, setScene] = React.useState("")
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // ---- result state ---------------------------------------------------
  const [resultTitle, setResultTitle] = React.useState("")
  const [words, setWords] = React.useState<string[]>([])
  const [engine, setEngine] = React.useState<"llm" | "rule" | null>(null)
  const [showEditTitle, setShowEditTitle] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState("")

  // ---- speech recognition state --------------------------------------
  const [listening, setListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    const SR: any =
      (typeof window !== "undefined" &&
        (window as any).SpeechRecognition) ||
      (window as any).webkitSpeechRecognition
    if (!SR) {
      setSpeechSupported(false)
      return
    }
    setSpeechSupported(true)
    try {
      const rec = new SR()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = "en-US"

      let finalText = ""
      rec.onresult = (e: any) => {
        let interim = ""
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript: string = e.results[i][0].transcript
          if (e.results[i].isFinal) finalText += transcript + " "
          else interim += transcript
        }
        setScene((prev) => {
          const base = finalText.trim()
          return base ? `${base}${interim ? " " + interim.trim() : ""}` : interim.trim() || prev
        })
      }
      rec.onend = () => {
        setListening(false)
      }
      rec.onerror = (e: any) => {
        console.warn("speech error", e)
        setListening(false)
      }
      recognitionRef.current = rec
    } catch (e) {
      console.warn("speech init failed:", e)
    }
  }, [])

  // ---- handlers ------------------------------------------------------
  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) return
    if (listening) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      setListening(false)
      return
    }
    try {
      rec.start()
      setListening(true)
    } catch (e) {
      console.warn("mic start failed", e)
      setListening(false)
    }
  }

  const handleGenerate = async () => {
    setError(null)
    if (!scene.trim()) {
      setError("Please describe a scene first — or try one of the examples below.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ai/generate-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene, difficulty }),
      })
      const data = (await res.json()) as ApiResp
      if (!res.ok || !("ok" in data) || data.ok !== true) {
        const err = "error" in data ? data.error : "Failed to generate words. Please try again."
        setError(err)
        if ("code" in data && data.code === "OUT_OF_CREDITS") {
          setError(
            "You're out of credits. Please upgrade your plan or sign in to continue."
          )
        }
        return
      }
      setResultTitle(data.title)
      setDraftTitle(data.title)
      setWords(data.words)
      setEngine(data.engine)
      setShowEditTitle(false)
      // refresh credit display
      if (typeof data.remainingCredits === "number" && updateSession) {
        await updateSession({ creditBalance: data.remainingCredits }).catch(() => {})
      }
    } catch (err) {
      console.error(err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // ---- in-place edit helpers ----------------------------------------
  const addWord = () => setWords((w) => [...w, ""])
  const updateWordAt = (i: number, val: string) =>
    setWords((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  const removeWordAt = (i: number) =>
    setWords((prev) => prev.filter((_, idx) => idx !== i))

  const validWords = words
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]{2,}$/.test(w))

  // ---- jump to puzzle maker -----------------------------------------
  const jumpToMaker = () => {
    if (validWords.length === 0) return
    const params = new URLSearchParams()
    params.set("title", resultTitle || "AI Word Search")
    params.set("words", validWords.join(","))
    params.set("wordSet", DIFFICULTY_TO_WORD_SET[difficulty])
    router.push(`/word-search-maker?${params.toString()}`)
  }

  const totalCredits = (session?.user?.creditBalance as number | undefined) ?? 0

  return (
    <div>
      {/* ============================================================
          HERO / INTRO
          ============================================================ */}
      <section className="border-b border-border bg-muted/30">
        <div className="container-app py-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/5 px-4 py-1.5 text-sm font-bold text-secondary no-select">
              <Sparkles className="h-4 w-4" />
              AI Word Bank Generator
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Type or say a scene —<br className="hidden sm:block" /> we&apos;ll build the word bank.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Describe any topic (&quot;space adventure&quot;, &quot;grandma&apos;s garden&quot;,
              &quot;a rainy day&quot;), pick a difficulty, and get a ready-to-print
              children&apos;s word search in one click.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT (input | result)
          ============================================================ */}
      <section className="py-10">
        <div className="container-app">
          <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
            {/* -------- LEFT: Input panel -------- */}
            <div className="space-y-4 no-print">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wand2 className="h-5 w-5 text-secondary" />
                    Describe a Scene
                  </CardTitle>
                  <CardDescription>
                    Tell us what your puzzle should be about. You can type or use your microphone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scene input + mic */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-scene">Scene / Topic</Label>
                    <div className="relative">
                      <Textarea
                        id="ai-scene"
                        placeholder="e.g. 'Pets in the backyard on a sunny afternoon'"
                        className="min-h-[140px] pr-14 resize-y"
                        value={scene}
                        onChange={(e) => setScene(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            handleGenerate()
                          }
                        }}
                        maxLength={600}
                      />
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={toggleMic}
                          aria-label={listening ? "Stop listening" : "Start voice input"}
                          className={`absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                            listening
                              ? "border-destructive bg-destructive text-white animate-pulse"
                              : "border-border bg-background hover:bg-muted text-foreground"
                          }`}
                        >
                          {listening ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {scene.length}/600 chars · Ctrl/⌘ + Enter to generate
                      </span>
                      {listening && (
                        <span className="inline-flex items-center gap-1 font-medium text-destructive">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                          Listening…
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Example scene chips */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-secondary" />
                      Try one of these
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_SCENES.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setScene(s.scene)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-all hover:border-secondary/40 hover:text-secondary hover:-translate-y-[1px]"
                        >
                          <span aria-hidden>{s.emoji}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty selector */}
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <div className="grid gap-2">
                      {DIFFICULTIES.map((d) => {
                        const active = difficulty === d.value
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setDifficulty(d.value)}
                            className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                              active
                                ? `border-secondary/70 ${d.accent} shadow-sm ring-2 ${d.ring}`
                                : "border-border hover:border-secondary/30 bg-card"
                            }`}
                          >
                            <span
                              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-xl shadow-sm"
                              aria-hidden
                            >
                              {d.emoji}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${active ? d.text : "text-foreground"}`}>
                                {d.tagline}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {d.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Generate */}
                  <Button
                    type="button"
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Generating words…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Word Bank
                      </>
                    )}
                  </Button>

                  {typeof totalCredits === "number" && (
                    <p className="text-center text-xs text-muted-foreground">
                      Uses 1 credit · you have{" "}
                      <span className="font-semibold text-foreground">
                        {totalCredits}
                      </span>{" "}
                      credits
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* -------- RIGHT: Result panel -------- */}
            <div className="space-y-4">
              {/* Mode buttons + jump to maker */}
              {words.length > 0 && (
                <div className="flex flex-col gap-2 no-print sm:flex-row">
                  <div className="flex flex-1 items-center gap-1 rounded-xl bg-muted/60 p-1">
                    <button
                      type="button"
                      onClick={() => setShowEditTitle(false)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                        !showEditTitle
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditTitle(true)
                        setDraftTitle(resultTitle)
                      }}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                        showEditTitle
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Words
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={jumpToMaker}
                    disabled={validWords.length === 0}
                    className="gap-1.5"
                  >
                    Make Puzzle
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {words.length > 0 ? (
                          <>
                            {showEditTitle ? (
                              <Input
                                value={draftTitle}
                                onChange={(e) => setDraftTitle(e.target.value)}
                                onBlur={() => {
                                  if (draftTitle.trim()) setResultTitle(draftTitle.trim())
                                }}
                                className="w-auto max-w-[22ch] border-0 px-0 text-xl font-bold shadow-none focus-visible:ring-0 h-8"
                                placeholder="Puzzle title"
                              />
                            ) : (
                              <span>{resultTitle || "Generated Word Bank"}</span>
                            )}
                            {engine && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-[10px] font-semibold uppercase tracking-wider"
                              >
                                {engine === "llm" ? "AI · GPT" : "Smart Match"}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <>Word Bank Preview</>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {words.length > 0
                          ? `${words.length} words · ${difficulty} level — edit or jump straight to the puzzle maker.`
                          : "Generate a word bank on the left, or try one of the example scenes."}
                      </CardDescription>
                    </div>
                    {words.length > 0 && !showEditTitle && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="no-print shrink-0 gap-1.5"
                        onClick={handleGenerate}
                        disabled={loading}
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                        />
                        Regenerate
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {words.length === 0 ? (
                    <EmptyResultState />
                  ) : showEditTitle ? (
                    <EditableWordsList
                      words={words}
                      onChangeWord={updateWordAt}
                      onRemove={removeWordAt}
                      onAdd={addWord}
                    />
                  ) : (
                    <PrettyWordGrid words={words} />
                  )}
                </CardContent>
              </Card>

              {/* Quick tip */}
              {words.length > 0 && !showEditTitle && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3 text-sm">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <div className="flex-1 text-muted-foreground">
                        Happy with the list? Hit{" "}
                        <span className="font-semibold text-foreground">Make Puzzle</span>{" "}
                        — it drops these words and title directly into the generator so
                        you can print, download PDF, or play online.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* =============================================================
              HOW TO section (short — matches site-wide style)
              ============================================================= */}
          <section
            id="how-it-works"
            className="mt-20 rounded-3xl border border-border bg-muted/20 p-6 sm:p-10"
          >
            <h2
              className="text-center text-2xl font-extrabold sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How it works · 3 steps
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: "🎤",
                  title: "1. Describe your scene",
                  body: "Type anything or tap the microphone — 'a visit to the farm', 'dinosaur museum', whatever your kid loves.",
                },
                {
                  icon: "🎚️",
                  title: "2. Pick a difficulty",
                  body: "Short simple words for little ones, or richer vocabulary for grades 3–4. All aligned to K–3 curricula.",
                },
                {
                  icon: "🧩",
                  title: "3. Make the puzzle",
                  body: "Jump to the generator with one click. Play online or print a beautiful PDF + answer key worksheet.",
                },
              ].map((s) => (
                <Card key={s.title} className="border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="text-4xl" aria-hidden>{s.icon}</div>
                    <h3 className="mt-3 text-lg font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {s.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button
                asChild
                size="lg"
                className="btn-pop rounded-[15px] bg-primary text-white hover:bg-primary font-extrabold h-12 border-0"
              >
                <Link href="/word-search-generator">
                  Browse 70+ premade templates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------------
   Subcomponents
   --------------------------------------------------------------------- */

function EmptyResultState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-3xl"
        aria-hidden
      >
        ✨
      </div>
      <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
        Your word bank will appear here
      </h3>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        Describe any scene on the left — for example &quot;grandma&apos;s vegetable
        garden&quot; — then click <span className="font-semibold text-foreground">Generate Word Bank</span>.
      </p>
    </div>
  )
}

function PrettyWordGrid({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w, i) => (
        <Badge
          key={`${w}-${i}`}
          variant="outline"
          className="rounded-xl px-3 py-1.5 text-[14px] font-semibold tracking-wide border-border bg-background"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {w}
        </Badge>
      ))}
    </div>
  )
}

function EditableWordsList({
  words,
  onChangeWord,
  onRemove,
  onAdd,
}: {
  words: string[]
  onChangeWord: (i: number, v: string) => void
  onRemove: (i: number) => void
  onAdd: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {words.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-xs font-bold text-muted-foreground text-right">
              {i + 1}.
            </span>
            <Input
              value={w}
              onChange={(e) => onChangeWord(i, e.target.value)}
              className="font-mono tracking-wide"
              placeholder="word"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove word ${i + 1}`}
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 gap-1.5"
        onClick={onAdd}
      >
        <Plus className="h-3.5 w-3.5" />
        Add a word
      </Button>
    </div>
  )
}
