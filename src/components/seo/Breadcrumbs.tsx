import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { JsonLd } from "./JsonLd"

export interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * 面包屑导航 + BreadcrumbList 结构化数据组件
 *
 * 同时输出：
 * 1. 可视的面包屑导航 UI
 * 2. BreadcrumbList JSON-LD 结构化数据（提升搜索引擎富片段展示）
 *
 * @example
 * <Breadcrumbs
 *   items={[
 *     { name: "Home", url: "https://example.com/" },
 *     { name: "Templates", url: "https://example.com/word-search-generator" },
 *     { name: "Animals", url: "https://example.com/theme/animals" },
 *   ]}
 * />
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

  // BreadcrumbList 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} id="breadcrumb-jsonld" />
      <nav
        aria-label="Breadcrumb"
        className="container-app pt-4"
      >
        <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const href = item.url.startsWith("http")
              ? item.url
              : `${baseUrl}${item.url}`

            return (
              <li key={item.url} className="flex items-center gap-1">
                {!isLast ? (
                  <>
                    <Link
                      href={href}
                      className="font-medium text-foreground/70 transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </>
                ) : (
                  <span className="font-semibold text-foreground" aria-current="page">
                    {item.name}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
