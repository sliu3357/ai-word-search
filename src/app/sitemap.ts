import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.wordsearchai.top"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<[path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number]> = [
    ["/", "weekly", 1],
    ["/ai-word-generator", "weekly", 0.95],
    ["/word-search-maker", "weekly", 0.9],
    ["/word-search-generator", "weekly", 0.9],
    ["/for-teachers", "monthly", 0.8],
    ["/for-kids", "monthly", 0.75],
    ["/pricing", "monthly", 0.6],
    ["/about", "monthly", 0.5],
    ["/faq", "monthly", 0.6],
    ["/privacy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
  ]

  return pages.map(([path, changeFrequency, priority]) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
