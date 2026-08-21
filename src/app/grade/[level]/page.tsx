import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { TemplateCard } from "@/components/templates/TemplateCard"
import { Breadcrumbs, JsonLd } from "@/components/seo"
import {
  GRADE_TEMPLATES,
  FEATURED_TEMPLATES,
} from "@/components/templates/template-data"
import {
  GRADE_CATEGORIES,
  findGradeBySlug,
} from "@/lib/template-categories"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

/**
 * 静态生成所有年级页面
 */
export function generateStaticParams() {
  return GRADE_CATEGORIES.map((g) => ({ level: g.slug }))
}

/**
 * 动态 metadata —— 每个年级页有独立的 title/description/keywords/canonical
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>
}): Promise<Metadata> {
  return (async () => {
    const { level } = await params
    const grade = findGradeBySlug(level)

    if (!grade) {
      return {
        title: "Grade Not Found",
      }
    }

    const url = `${baseUrl}/grade/${grade.slug}`

    return {
      title: grade.title,
      description: grade.description,
      keywords: grade.keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: grade.title,
        description: grade.description,
        url,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: grade.title,
        description: grade.description,
      },
    }
  })()
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { level } = await params
  const grade = findGradeBySlug(level)

  if (!grade) {
    notFound()
  }

  const templates = GRADE_TEMPLATES.filter((t) =>
    grade.templateSlugs.includes(t.slug)
  )

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
        name: grade.name,
        item: `${baseUrl}/grade/${grade.slug}`,
      },
    ],
  }

  // ItemList 结构化数据
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${grade.name} Word Search Puzzles`,
    itemListElement: templates.map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: t.title,
      url: `${baseUrl}/word-search-maker?template=${t.slug}`,
    })),
  }

  // EducationalOccupationalCredential-style：用 EducationEvent 标记教学场景
  const educationSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: grade.title,
    description: grade.description,
    educationalLevel: grade.name,
    learningResourceType: "Worksheet",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    url: `${baseUrl}/grade/${grade.slug}`,
  }

  return (
    <PageLayout>
      <JsonLd data={breadcrumbSchema} id="ld-breadcrumb" />
      <JsonLd data={itemListSchema} id="ld-itemlist" />
      <JsonLd data={educationSchema} id="ld-learning" />

      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Templates", url: "/word-search-generator" },
          { name: grade.name, url: `/grade/${grade.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F2F8F5] py-14 md:py-20">
        <div className="container-app">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="text-[13px] font-bold tracking-[0.2em] text-secondary uppercase">
                Grade Level · {grade.shortName}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
              {grade.title}
            </h1>
            <p className="mt-4 text-[17px] md:text-lg leading-relaxed text-foreground/70">
              {grade.description}
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
                  Browse all grades
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
            {grade.name} word search puzzles
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured 推荐 */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-app">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Popular across all grades
          </h2>
          <p className="text-foreground/70 mb-8">
            Hand-picked favorites loved by kids, parents, and teachers.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-12 md:py-16">
        <div className="container-app">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              About our {grade.name.toLowerCase()} word search puzzles
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              Our {grade.name.toLowerCase()} word search puzzles are carefully
              aligned with Common Core standards, Dolch sight word lists, and Fry
              word lists. Each puzzle is designed at the right reading level for{" "}
              {grade.name.toLowerCase()} students — with vocabulary that&apos;s
              age-appropriate and academically relevant.
            </p>
            <p className="text-foreground/70 leading-relaxed mt-4">
              Every puzzle is free to play online or print as a classroom
              worksheet. Teachers can customize the word list, choose difficulty
              options (diagonals, backwards, case), and generate a unique puzzle
              every time. Great for spelling review, sight word practice,
              vocabulary building, and early finisher activities.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link to other grades */}
      <section className="py-12 border-t border-border">
        <div className="container-app">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Browse other grade levels
          </h3>
          <div className="flex flex-wrap gap-2">
            {GRADE_CATEGORIES.filter((g) => g.slug !== grade.slug).map((g) => (
              <Link
                key={g.slug}
                href={`/grade/${g.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{g.shortName}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
