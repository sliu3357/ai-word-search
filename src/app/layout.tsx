import type { Metadata } from "next"
import { Baloo_2, Nunito } from "next/font/google"
import "./globals.css"
import { AppSessionProvider } from "@/components/providers/SessionProvider"

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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://word-puzzle-generator.vercel.app"

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Word Puzzle Generator",
    title: "Word Search Generator - Create Custom Printable Word Puzzles Free",
    description:
      "Make custom word search puzzles with your own words. Free printable PDF and online play.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Search Generator - Create Custom Word Puzzles",
    description: "Make custom word search puzzles with your own words. Free and easy to use.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <AppSessionProvider>
          {/* WebApplication Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Word Puzzle Generator",
                applicationCategory: "EducationApplication",
                operatingSystem: "Web Browser",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                url: baseUrl,
              }),
            }}
          />
          {children}
        </AppSessionProvider>
      </body>
    </html>
  )
}
