import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.wordsearchai.top"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/", "/login", "/register", "/settings/"],
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
    host: baseUrl,
  }
}
