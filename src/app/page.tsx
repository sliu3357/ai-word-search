import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Grid3X3,
  PencilLine,
  Play,
  Sparkles,
  Users,
  Wand2,
  Heart,
} from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FeaturedTemplatesSection } from "@/components/templates/TemplateCard"

export const metadata: Metadata = {
  title: "Wordly - Turn every word into a discovery",
  description:
    "Create beautiful word-search games in seconds. Perfect for classrooms, homes, and every little explorer who loves to learn.",
  keywords: [
    "word search generator",
    "word search maker",
    "printable word puzzles",
    "kids word search",
    "teacher worksheets",
    "vocabulary games",
  ],
}

const FEATURES = [
  {
    icon: Grid3X3,
    title: "Custom Word Search",
    description:
      "Paste your own vocabulary list and instantly generate a personalized word search puzzle. Great for spelling practice and vocabulary review.",
  },
  {
    icon: FileText,
    title: "Printable & PDF",
    description:
      "Export your puzzle as a clean printable worksheet. Ready for the classroom, homework, or a road-trip activity booklet.",
  },
  {
    icon: Play,
    title: "Play Online",
    description:
      "Solve puzzles interactively in the browser. Perfect for distance learning, early finishers, and digital centers.",
  },
] as const

/* ================= Hero：参考「找找乐」风格，薄荷绿大圆角卡片 + emoji 装饰 ================= */
function Hero() {
  return (
    <section className="relative overflow-hidden px-4 md:px-6 pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-[32px] bg-[var(--mint)] grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] items-center gap-6 px-6 py-10 md:px-14 md:py-12 lg:min-h-[300px]">
        {/* 左侧：文案 */}
        <div className="relative z-10 max-w-xl">
          {/* 小标签（参考找找乐 .eyebrow） */}
          <p className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#e77947] mb-1.5">
            ✦ Today's little challenge
          </p>

          {/* 大标题（Baloo 2 800，em 用暖橙） */}
          <h1 className="text-[clamp(35px,4.2vw,54px)] leading-[1.04] font-extrabold text-foreground tracking-tight">
            Find the hidden words
            <br />
            <em className="not-italic text-[#ec7741]">in the letter forest!</em>
          </h1>

          {/* 描述 */}
          <p className="mt-3.5 text-[17px] leading-[1.7] text-[#54707a] max-w-[500px]">
            Slide across the letters and discover every secret word. Ready to
            become a little word detective?
          </p>

          {/* CTA 按钮组：立体「积木」按钮 */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="btn-pop h-[52px] px-6 text-[15px] font-extrabold rounded-[15px] bg-primary hover:bg-primary text-white border-0"
            >
              <Link href="/word-search-maker">
                🎯 Start finding words
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-[52px] px-5 text-[15px] font-extrabold rounded-full bg-white text-foreground border-2 border-[#f2dfbc] hover:bg-white shadow-none hover:shadow-sm"
              variant="ghost"
            >
              <Link href="/word-search-generator">
                📚 Browse templates
              </Link>
            </Button>
          </div>

          {/* 信任条：emoji 头像 + 统计 */}
          <div className="mt-6 flex items-center gap-3 text-[14px] text-[#54707a]">
            <div className="flex -space-x-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd761] text-base ring-2 ring-[var(--mint)]">🐱</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#a9e6bd] text-base ring-2 ring-[var(--mint)]">🐶</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffcf6b] text-base ring-2 ring-[var(--mint)]">🦊</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fee9d6] text-sm font-extrabold ring-2 ring-[var(--mint)]">+</span>
            </div>
            <span>
              Join <b className="text-[#e77843]">10,000+</b> parents and teachers playing along
            </span>
          </div>
        </div>

        {/* 右侧：emoji 插画（参考找找乐 .hero-art） */}
        <div className="relative h-[180px] md:h-[244px] lg:h-[244px]" aria-hidden="true">
          {/* 太阳 */}
          <span className="absolute right-[15%] top-[-20px] text-[88px] leading-none">☀</span>
          {/* 云朵 1 */}
          <span className="absolute left-2 top-7 text-[53px] leading-none text-white" style={{ filter: "drop-shadow(0 4px 2px #bfdcca99)" }}>☁</span>
          {/* 云朵 2 */}
          <span className="absolute right-1 top-[75px] text-[40px] leading-none text-white" style={{ filter: "drop-shadow(0 4px 2px #bfdcca99)" }}>☁</span>
          {/* 树 1 */}
          <span className="absolute bottom-[-20px] left-1 text-[108px] leading-none">🌳</span>
          {/* 树 2 */}
          <span className="absolute bottom-[-20px] right-2 text-[94px] leading-none">🌲</span>
          {/* 狐狸 */}
          <span className="absolute bottom-3 left-[44%] text-[82px] leading-none animate-float-soft" style={{ filter: "drop-shadow(0 8px 2px #bbd8b999)" }}>🦊</span>
          {/* 装饰星星 */}
          <span className="absolute left-[30%] top-4 text-[20px] leading-none text-[var(--sun)]">✦</span>
          <span className="absolute right-[8%] bottom-12 text-[16px] leading-none text-[var(--accent)]">✦</span>
        </div>
      </div>
    </section>
  )
}

/* ================= Features + How It Works 合并区块（参考找找乐风格） ================= */
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-24">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#e77947] mb-1.5">
            ✦ Simple & playful
          </p>
          <h2 className="text-[clamp(32px,3.5vw,44px)] font-extrabold text-foreground leading-tight">
            Make your own word search
            <br className="hidden sm:block" />in just three steps ✨
          </h2>
          <p className="mt-3 text-[17px] text-[#54707a] leading-relaxed">
            From classroom worksheets to family game night — everything you
            need in one place.
          </p>
        </div>

        {/* 三步工作流（emoji 大图标 + 大圆角卡片） */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              emoji: "✏️",
              step: "1",
              title: "Enter your words",
              description:
                "Paste any word list — vocabulary, spelling words, themed terms, or your own custom list.",
              tint: "bg-[#fff4e5]",
            },
            {
              emoji: "🪄",
              step: "2",
              title: "Generate puzzle",
              description:
                "Pick difficulty (case, directions, backwards) and instantly get a one-of-a-kind puzzle.",
              tint: "bg-[#dff5e8]",
            },
            {
              emoji: "🖨️",
              step: "3",
              title: "Print or play online",
              description:
                "Print a clean worksheet, download as HTML, or play on screen. Reveal the answer key anytime.",
              tint: "bg-[#e6f0ff]",
            },
          ].map((step, idx) => (
            <div
              key={step.title}
              className="relative rounded-[24px] border-2 border-[#f2dfbc] bg-white p-6 hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-[36px] ${step.tint}`}>
                  {step.emoji}
                </div>
                <span className="text-[44px] font-black text-[#f2dfbc] leading-none">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-5 text-[22px] font-extrabold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.7] text-[#54707a]">
                {step.description}
              </p>
              {idx < 2 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-[var(--sun)] text-white text-sm font-bold shadow">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 三个人群：老师 / 家长 / 孩子 */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              emoji: "👩‍🏫",
              title: "For Teachers",
              tint: "bg-[#dff5e8]",
              description:
                "Build vocabulary, spelling, and themed units in seconds. Multiple difficulty levels for every learner.",
              points: ["Differentiated spelling practice", "Themed units for any topic", "Unlimited printable copies"],
            },
            {
              emoji: "👨‍👩‍👧",
              title: "For Parents",
              tint: "bg-[#fff4e5]",
              description:
                "Turn screen time into learning time. Perfect for weekends, holidays, and travel.",
              points: ["Fun learning activities", "Holiday & travel printables", "No signup needed to start"],
            },
            {
              emoji: "🧒",
              title: "For Kids",
              tint: "bg-[#e6f0ff]",
              description:
                "Turn your own word lists into a game. Self-check with the answer key and make review feel like a quest.",
              points: ["Self-paced vocabulary review", "Instant answer key checking", "Works on phone or laptop"],
            },
          ].map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-[24px] border-2 border-[#f2dfbc] bg-white p-6 hover:-translate-y-1 transition-transform"
            >
              <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-[32px] ${useCase.tint}`}>
                {useCase.emoji}
              </div>
              <h3 className="text-[22px] font-extrabold text-foreground">
                {useCase.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#54707a]">
                {useCase.description}
              </p>
              <ul className="mt-4 space-y-2.5">
                {useCase.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-[15px] font-semibold text-foreground/85"
                  >
                    <span className="mt-0.5 text-[var(--primary)]">❤</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================= CTA 最终行动号召（参考找找乐风格） ================= */
function CtaSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--mint)] border-2 border-[#c8e6d2] px-6 py-14 text-center sm:px-12 md:py-16">
          {/* emoji 装饰 */}
          <span className="absolute left-6 top-6 text-[40px] opacity-80 select-none" aria-hidden="true">🌈</span>
          <span className="absolute right-6 top-8 text-[36px] opacity-80 select-none" aria-hidden="true">⭐</span>
          <span className="absolute left-10 bottom-6 text-[32px] opacity-70 select-none" aria-hidden="true">✏️</span>
          <span className="absolute right-10 bottom-8 text-[32px] opacity-70 select-none" aria-hidden="true">🦊</span>

          <div className="relative mx-auto max-w-2xl">
            <p className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#e77947] mb-1.5">
              ✦ Free to start
            </p>
            <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold text-foreground leading-tight">
              Make a word search and
              <br className="hidden sm:block" />start today's adventure!
            </h2>
            <p className="mt-3 text-[16px] text-[#54707a] leading-relaxed">
              Join thousands of teachers, parents, and kids already playing. No
              account needed to begin.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="btn-pop h-[52px] px-6 text-[15px] font-extrabold rounded-[15px] bg-primary text-white border-0"
              >
                <Link href="/word-search-maker">
                  🎯 Make a puzzle now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-[52px] px-5 text-[15px] font-extrabold rounded-full bg-white text-foreground border-2 border-[#f2dfbc] hover:bg-white shadow-none"
                variant="ghost"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <PageLayout containerClassName="!max-w-none !px-0">
      <Hero />
      <FeaturedTemplatesSection
        eyebrow="Quick Start"
        title="Featured templates, ready to play"
        subtitle="Hand-picked word searches for every classroom, home, and rainy-day fun. Click any card to open in the maker and start customizing."
      />
      <HowItWorks />
      <CtaSection />
    </PageLayout>
  )
}
