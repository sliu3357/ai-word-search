import type { Metadata } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import "./globals.css"
import { AppSessionProvider } from "@/components/providers/SessionProvider"
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider"
import { JsonLd } from "@/components/seo"

// 童趣圆润标题字体（Baloo 2）+ 圆润正文字体（Nunito）—— 参考「找找乐」风格
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.wordsearchai.top"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Word Search Generator - Create Custom Printable Word Puzzles Free",
    template: "%s | Word Puzzle Generator",
  },
  description:
    "Make custom word search puzzles with your own words. Free printable PDF, online play, and preset templates for teachers and kids. No signup needed to start.",
  keywords: [
    "word search generator",
    "word search maker",
    "word puzzle maker",
    "printable word search",
    "word search puzzle",
    "custom word search",
  ],
  authors: [{ name: "Word Puzzle Generator" }],
  creator: "Word Puzzle Generator",
  applicationName: "Wordly",
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Word Puzzle Generator",
    title: "Word Search Generator - Create Custom Printable Word Puzzles Free",
    description:
      "Make custom word search puzzles with your own words. Free printable PDF and online play.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Search Generator - Create Custom Word Puzzles",
    description: "Make custom word search puzzles with your own words. Free and easy to use.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

// Organization + WebSite 结构化数据（提升搜索引擎富片段展示）
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wordly",
  url: baseUrl,
  logo: `${baseUrl}/icon.svg`,
  description:
    "Free word search puzzle generator for teachers, parents, and kids. Create custom printable puzzles with your own vocabulary words.",
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Word Puzzle Generator",
  url: baseUrl,
  description:
    "Make custom word search puzzles with your own words. Free printable PDF, online play, and preset templates for teachers and kids.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/word-search-maker?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Domain canonicalization: redirect non-www to www before any rendering */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var host = window.location.hostname;
              if (host === 'wordsearchai.top') {
                window.location.replace('https://www.wordsearchai.top' + window.location.pathname + window.location.search + window.location.hash);
              }
            })();
          `,
        }} />
        <AppSessionProvider>
          {/* Organization Schema */}
          <JsonLd data={organizationSchema} id="ld-organization" />
          {/* WebSite Schema（带 SearchAction） */}
          <JsonLd data={websiteSchema} id="ld-website" />
          {/* WebApplication Schema */}
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Wordly",
              applicationCategory: "EducationApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              url: baseUrl,
            }}
            id="ld-webapp"
          />
          {children}
          {/* 网站流量统计：GA4 + Vercel Analytics */}
          <AnalyticsProvider />
        </AppSessionProvider>
      </body>
    </html>
  )
}
