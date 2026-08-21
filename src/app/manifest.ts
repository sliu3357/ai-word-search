import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

  return {
    name: "Wordly - Word Search Generator",
    short_name: "Wordly",
    description:
      "Make custom word search puzzles with your own words. Free printable PDF, online play, and preset templates for teachers and kids.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["education", "kids", "games", "productivity"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Make a puzzle",
        short_name: "Maker",
        description: "Create a custom word search puzzle",
        url: `${baseUrl}/word-search-maker`,
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
      {
        name: "Browse templates",
        short_name: "Templates",
        description: "Browse 70+ preset word search templates",
        url: `${baseUrl}/word-search-generator`,
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
      {
        name: "AI Word Generator",
        short_name: "AI",
        description: "Generate word banks from any scene with AI",
        url: `${baseUrl}/ai-word-generator`,
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
    ],
  }
}
