import * as React from "react"

/**
 * JSON-LD 结构化数据组件
 *
 * 使用 Next.js Script 组件渲染 application/ld+json，
 * 用于在页面注入 schema.org 结构化数据，提升 SEO 富片段展示。
 *
 * @example
 * <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [...] }} />
 */
export function JsonLd({
  data,
  id,
}: {
  data: Record<string, unknown> | Record<string, unknown>[]
  id?: string
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
