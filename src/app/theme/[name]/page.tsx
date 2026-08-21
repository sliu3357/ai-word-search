import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { TemplateCard } from "@/components/templates/TemplateCard"
import { Breadcrumbs, JsonLd } from "@/components/seo"
import { THEME_TEMPLATES } from "@/components/templates/template-data"
import {
  THEME_CATEGORIES,
  findThemeBySlug,
} from "@/lib/template-categories"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

/**
 * 静态生成所有主题页面 —— 预生成 11 个主题页，提升 SEO 和首屏性能
 */
export function generateStaticParams() {
  return THEME_CATEGORIES.map((cat) => ({ name: cat.slug }))
}

/**
 * 动态 metadata —— 每个主题页有独立的 title/description/keywords/canonical
 * 提升长尾关键词覆盖
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  return (async () => {
    const { name } = await params
    const theme = findThemeBySlug(name)

    if (!theme) {
      return {
        title: "Theme Not Found",
      }
    }

    const url = `${baseUrl}/theme/${theme.slug}`

    return {
      title: theme.title,
      description: theme.description,
      keywords: theme.keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: theme.title,
        description: theme.description,
        url,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: theme.title,
        description: theme.description,
      },
    }
  })()
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const theme = findThemeBySlug(name)

  if (!theme) {
    notFound()
  }

  const templates = THEME_TEMPLATES.filter((t) => t.category === theme.name)

  // BreadcrumbList 结构化数据
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Templates",
        item: `${baseUrl}/word-search-generator`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: theme.name,
        item: `${baseUrl}/theme/${theme.slug}`,
      },
    ],
  }

  // ItemList 结构化数据（帮助搜索引擎理解这是一组相关项目）
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${theme.name} Word Search Puzzles`,
    itemListElement: templates.map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: t.title,
      url: `${baseUrl}/word-search-maker?template=${t.slug}`,
    })),
  }

  return (
    <PageLayout>
      <JsonLd data={breadcrumbSchema} id="ld-breadcrumb" />
      <JsonLd data={itemListSchema} id="ld-itemlist" />

      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Templates", url: "/word-search-generator" },
          { name: theme.name, url: `/theme/${theme.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F2F8F5] py-14 md:py-20">
        <div className="container-app">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{theme.emoji}</span>
              <div className="text-[13px] font-bold tracking-[0.2em] text-secondary uppercase">
                {theme.name}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
              {theme.title}
            </h1>
            <p className="mt-4 text-[17px] md:text-lg leading-relaxed text-foreground/70">
              {theme.subtitle}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/60 max-w-2xl">
              {theme.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="rounded-2xl bg-primary hover:bg-primary/90 text-white px-5 h-12 font-semibold shadow-sm"
              >
                <Link href="/word-search-maker">
                  <Sparkles className="h-4 w-4" />
                  Make a custom puzzle
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-2xl h-12 px-5 font-semibold"
              >
                <Link href="/word-search-generator">
                  Browse all themes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates grid */}
      <section className="py-14 md:py-16">
        <div className="container-app">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            {templates.length} {theme.name} word search puzzles
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO content —— 帮助搜索引擎理解页面主题，同时为用户提供价值 */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-app">
          <div className="mx-auto max-w-3xl prose prose-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              About our {theme.name.toLowerCase()} word search puzzles
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              Our {theme.name.toLowerCase()} word search puzzles are designed for
              kids, teachers, and parents who want to combine learning with fun.
              Each puzzle is free to play online or print as a PDF worksheet for
              the classroom. Choose from multiple difficulty levels — easy for
              young learners, medium for elementary students, and hard for a
              real challenge.
            </p>
            <p className="text-foreground/70 leading-relaxed mt-4">
              Every {theme.name.toLowerCase()} puzzle can be customized with your
              own words. Click any template above to open it in our Word Search
              Maker, where you can add or remove words, change difficulty
              settings (diagonals, backwards, uppercase/lowercase), and generate
              a unique puzzle every time.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link to other themes (内链优化) */}
      <section className="py-12 border-t border-border">
        <div className="container-app">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Browse other themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {THEME_CATEGORIES.filter((t) => t.slug !== theme.slug).map((t) => (
              <Link
                key={t.slug}
                href={`/theme/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
