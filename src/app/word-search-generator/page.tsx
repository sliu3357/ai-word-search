import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Sparkles } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  FEATURED_TEMPLATES,
  GRADE_TEMPLATES,
  THEME_TEMPLATES,
} from "@/components/templates/template-data"
import { TemplateCard } from "@/components/templates/TemplateCard"
import { Breadcrumbs } from "@/components/seo"
import { GRADE_CATEGORIES } from "@/lib/template-categories"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

export const metadata: Metadata = {
  title: "Word Search Templates - 70+ Free Preset Puzzles | Wordly",
  description:
    "Browse 70+ printable word search puzzle templates for kids, teachers, and every grade level. Animals, food, nature, science, geography, sports, art, shopping, family, emotions, clothes themes and Dolch sight words — click to use instantly.",
  keywords: [
    "free word search templates",
    "kids word search printable",
    "preschool sight words",
    "Dolch word puzzles",
    "first grade word search",
    "animal word search",
    "science word search",
    "geography word search",
    "art word search",
    "shopping word search",
    "family word search",
    "emotions word search",
    "clothes word search",
  ],
  alternates: {
    canonical: `${baseUrl}/word-search-generator`,
  },
}

/* Theme category metadata */
const THEME_CATEGORIES = [
  { name: "Animals", slug: "animals", emoji: "🐾" },
  { name: "Food", slug: "food", emoji: "🍎" },
  { name: "Nature", slug: "nature", emoji: "🌿" },
  { name: "Science", slug: "science", emoji: "🔬" },
  { name: "Geography", slug: "geography", emoji: "🌍" },
  { name: "Sports", slug: "sports", emoji: "⚽" },
  { name: "Art", slug: "art", emoji: "🎨" },
  { name: "Shopping", slug: "shopping", emoji: "🛒" },
  { name: "Family", slug: "family", emoji: "👨‍👩‍👧" },
  { name: "Emotions", slug: "emotions", emoji: "😊" },
  { name: "Clothes", slug: "clothes", emoji: "👕" },
] as const

/* Category section descriptions */
const CATEGORY_DESCRIPTIONS: Record<string, { title: string; subtitle: string }> = {
  Animals: {
    title: "Animal word searches",
    subtitle: "From farmyard friends to fierce dinosaurs — perfect for young animal lovers.",
  },
  Food: {
    title: "Food & snack puzzles",
    subtitle: "Breakfast, vegetables, desserts and more — tasty vocabulary for every meal.",
  },
  Nature: {
    title: "Nature & outdoors",
    subtitle: "Weather, trees, flowers, mountains — explore the natural world through words.",
  },
  Science: {
    title: "Science & discovery",
    subtitle: "Space, chemistry, the human body and weather science for curious minds.",
  },
  Geography: {
    title: "Geography & maps",
    subtitle: "Continents, landforms, US states and world capitals for young explorers.",
  },
  Sports: {
    title: "Sports & games",
    subtitle: "Basketball, soccer, Olympics and more — active vocabulary for sports fans.",
  },
  Art: {
    title: "Art & creativity",
    subtitle: "Drawing, painting, colors and sculpture — vocabulary for budding young artists.",
  },
  Shopping: {
    title: "Shopping & stores",
    subtitle: "Supermarket, checkout, coupons and more — everyday shopping vocabulary for kids.",
  },
  Family: {
    title: "Family & people",
    subtitle: "Family members, friends, cousins and celebrations — words about the people we love.",
  },
  Emotions: {
    title: "Emotions & feelings",
    subtitle: "Feelings, happiness, confidence and patience — vocabulary for little hearts.",
  },
  Clothes: {
    title: "Clothes & fashion",
    subtitle: "Tops, pants, shoes and accessories — everyday clothing vocabulary for kids.",
  },
}

/* Render all theme category sections */
function ThemeCategorySections() {
  return (
    <>
      {THEME_CATEGORIES.map((cat, idx) => {
        const templates = THEME_TEMPLATES.filter((t) => t.category === cat.name)
        if (templates.length === 0) return null
        const desc = CATEGORY_DESCRIPTIONS[cat.name]
        const isAlt = idx % 2 === 1

        return (
          <section
            key={cat.slug}
            id={`theme-${cat.slug}`}
            className={`scroll-mt-20 py-14 md:py-16 ${isAlt ? "bg-[#FAF8F2]" : "bg-background"}`}
          >
            <div className="container-app">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="text-[13px] font-bold tracking-[0.2em] text-secondary uppercase">
                      {cat.name}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {desc.title}
                  </h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-foreground/70">
                    {desc.subtitle}
                  </p>
                </div>
                <Link
                  href={`/theme/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 text-[15px] font-bold text-secondary hover:underline underline-offset-4 shrink-0"
                >
                  View all {cat.name.toLowerCase()} puzzles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ========================================================================
   Templates Library Page
   - Hero (顶部：QUICK START + 标题 + 副标题 + 4 Featured
   - By Grade Level (4张)
   - By Theme (4张)
   - Start from scratch CTA (自定义入口)
======================================================================== */
export default function WordSearchTemplatesPage() {
  return (
    <PageLayout containerClassName="!max-w-none !px-0">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Templates", url: "/word-search-generator" },
        ]}
      />
      {/* 1) HERO / QUICK START + FEATURED */}
      <section className="relative overflow-hidden bg-[#F2F8F5] py-16 md:py-20">
        <div className="container-app">
          {/* 顶部 Hero 标题文字 */}
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-3xl">
              <div className="text-[13px] font-bold tracking-[0.2em] text-secondary uppercase mb-3">
                Quick Start
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
                Featured templates,{" "}
                <span className="text-secondary">ready to play</span>
              </h1>
              <p className="mt-4 text-[17px] md:text-lg leading-relaxed text-foreground/70 max-w-2xl">
                Hand-picked word searches for every classroom, home, and rainy-day
                fun. Click any template to open in the maker and customize it with your
                own words — or print instantly.
              </p>
            </div>
            <Button
              asChild
              className="mt-6 md:mt-0 rounded-2xl bg-primary hover:bg-primary/90 text-white px-5 h-12 font-semibold shadow-sm"
            >
              <Link href="/word-search-maker">
                <Sparkles className="h-4 w-4" />
                Make from scratch
              </Link>
            </Button>
          </div>

          {/* Featured 4 卡片 */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      </section>

      {/* 2) By Grade Level (S分级） */}
      <section id="grade-level" className="scroll-mt-20 py-16 md:py-20 bg-background">
        <div className="container-app">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-10">
            <div className="max-w-2xl">
              <div className="text-[13px] font-bold tracking-[0.2em] text-secondary uppercase mb-3">
                By Grade Level
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Grade-aligned word practice
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-foreground/70">
                Aligned with Dolch sight words lists, Fry lists, and US Common
                Core spelling — choose the perfect list for Pre-K through
                Grade 5.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GRADE_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>

          {/* 年级内链 —— 跳转到 /grade/[slug] 语义化页面 */}
          <div className="mt-8 flex flex-wrap gap-2">
            {GRADE_CATEGORIES.map((g) => (
              <Link
                key={g.slug}
                href={`/grade/${g.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {g.shortName} word searches
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3) Theme Category Quick Nav — Sticky below header */}
      <section
        id="theme-nav"
        className="sticky top-16 z-40 w-full border-b border-black/[0.03] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print"
        aria-label="Theme categories"
      >
        <div className="container-app">
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:justify-center sm:flex-wrap sm:gap-3 sm:overflow-visible sm:py-4">
            {THEME_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`#theme-${cat.slug}`}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 sm:px-4 py-2 min-h-[44px] text-sm font-semibold text-foreground/80 shadow-sm ring-1 ring-black/[0.04] transition-all hover:ring-secondary/30 hover:text-secondary hover:-translate-y-[1px]"
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3.1) By Theme — Category Sections */}
      <ThemeCategorySections />

      {/* 4) Start from Scratch CTA */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E0EBFF] via-white to-[#FAF8F2] px-8 py-14 text-center shadow-[0_10px_40px_-16px_rgba(45,110,247,0.25)] ring-1 ring-secondary/10 md:px-16">
            <div className="absolute -top-20 -left-16 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-secondary ring-1 ring-secondary/10 shadow-sm mb-6">
                <Sparkles className="h-4 w-4" />
                Have your own word list?
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Paste your words & make a puzzle
                <br className="hidden sm:block" /> in under 10 seconds.
              </h2>
              <p className="mt-4 text-[17px] text-foreground/75 leading-relaxed">
                Your spelling words, vocabulary list, themed terms, or the week&apos;s
                homework — paste them in, hit Generate, and you&apos;re ready to
                print, share, or play online.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-[16px] font-semibold rounded-2xl bg-secondary hover:bg-secondary/92 text-white shadow-[0_10px_30px_-10px_rgba(45,110,247,0.55)]"
                >
                  <Link href="/word-search-maker">
                    Open the Maker
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-[16px] font-semibold rounded-2xl border-foreground/10 bg-white hover:bg-foreground/5"
                >
                  <Link href="/pricing">See pricing plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
