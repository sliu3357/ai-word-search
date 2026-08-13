"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { PresetTemplate } from "./template-data"
import { FEATURED_TEMPLATES } from "./template-data"

// Re-export data for convenience
export {
  FEATURED_TEMPLATES,
  GRADE_TEMPLATES,
  THEME_TEMPLATES,
} from "./template-data"
export type { PresetTemplate, WordSet } from "./template-data"

/* ========================================================================
   TemplateCard - 单张卡片组件（可复用，含词组切换）
======================================================================== */
interface TemplateCardProps {
  template: PresetTemplate
  actionHref?: string
  className?: string
}

export function TemplateCard({
  template,
  actionHref,
  className = "",
}: TemplateCardProps) {
  const [selectedSet, setSelectedSet] = React.useState(1) // default to Medium (index 1)

  const currentSet = template.wordSets[selectedSet]
  const currentWords = currentSet?.words ?? []
  const currentLabel = currentSet?.label ?? "Medium"

  const href =
    actionHref ??
    `/word-search-maker?template=${encodeURIComponent(template.slug)}&words=${encodeURIComponent(currentWords.join(","))}&title=${encodeURIComponent(template.title)}&wordSet=${encodeURIComponent(currentLabel)}`

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(12,42,68,0.06)] ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_10px_30px_-12px_rgba(12,42,68,0.18)] ${className}`}
    >
      {/* 顶部色块 + 2个大emoji */}
      <div
        className="relative h-[130px] w-full flex items-center justify-center gap-4 md:gap-6"
        style={{ backgroundColor: template.tint }}
        aria-hidden="true"
      >
        <span className="select-none text-[46px] md:text-[54px] leading-none drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          {template.emoji1}
        </span>
        <span className="select-none text-[46px] md:text-[54px] leading-none drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {template.emoji2}
        </span>
      </div>

      {/* 文字区 */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[18px] font-bold leading-tight text-foreground">
          {template.title}
        </h3>

        <p className="text-[14px] text-muted-foreground">
          <span>{template.grade}</span>
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          <span>{currentWords.length} words</span>
        </p>

        {/* 词组切换 */}
        <div className="flex gap-1.5 pt-1">
          {template.wordSets.map((set, idx) => (
            <button
              key={set.label}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setSelectedSet(idx)
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedSet === idx
                  ? "bg-secondary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
              }`}
            >
              {set.label}
              <span className="ml-1 opacity-70">{set.words.length}</span>
            </button>
          ))}
        </div>

        {/* 当前词组预览 */}
        <div className="flex flex-wrap gap-1 pt-1">
          {currentWords.slice(0, 6).map((w) => (
            <span
              key={w}
              className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-foreground/60"
            >
              {w}
            </span>
          ))}
          {currentWords.length > 6 && (
            <span className="text-[11px] font-medium text-muted-foreground/50 py-0.5">
              +{currentWords.length - 6}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-secondary hover:underline underline-offset-4"
          >
            Use this template
            <ArrowRight className="h-[16px] w-[16px] transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================
   FeaturedTemplatesSection - 首页/Templates页面复用的精选模板区
======================================================================== */
interface FeaturedTemplatesSectionProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  showViewAll?: boolean
  bgClassName?: string
}

export function FeaturedTemplatesSection({
  eyebrow = "Quick Start",
  title = "Featured templates, ready to play",
  subtitle,
  showViewAll = true,
  bgClassName = "bg-transparent",
}: FeaturedTemplatesSectionProps) {
  return (
    <section className={`relative overflow-hidden py-20 md:py-24 ${bgClassName}`}>
      <div className="container-app">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <div className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#e77947] mb-1.5">
                ✦ {eyebrow}
              </div>
            )}
            <h2 className="text-[clamp(28px,3vw,40px)] font-extrabold tracking-tight text-foreground leading-[1.1]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-[17px] leading-relaxed text-[#54707a]">
                {subtitle}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              href="/word-search-generator"
              className="hidden md:inline-flex items-center gap-1.5 text-[15px] font-bold text-foreground/85 hover:text-primary transition-colors"
            >
              View all templates
              <ArrowRight className="h-[16px] w-[16px]" />
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/word-search-generator"
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-secondary underline underline-offset-4"
            >
              View all templates
              <ArrowRight className="h-[16px] w-[16px]" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
