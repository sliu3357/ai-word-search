import type { Metadata } from "next"
import Script from "next/script"
import { Baloo_2, Nunito } from "next/font/google"
import "./globals.css"
import { AppSessionProvider } from "@/components/providers/SessionProvider"

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
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Word Search Generator – Create Free Printable Puzzles",
    template: "%s | Wordly",
  },
  description:
    "Create custom word search puzzles from your own word lists. Free printable worksheets, online play, and ready-to-use templates for teachers, parents, and kids.",
  keywords: [
    "word search generator",
    "word search maker",
    "printable word search",
    "word search puzzle",
    "custom word search",
    "vocabulary worksheet maker",
  ],
  authors: [{ name: "Wordly" }],
  creator: "Wordly",
  publisher: "Wordly",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Wordly",
    title: "Word Search Generator – Create Free Printable Puzzles",
    description:
      "Make custom, printable word search puzzles in seconds for class, home, or play.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Search Generator – Create Free Printable Puzzles",
    description:
      "Make custom, printable word search puzzles in seconds for class, home, or play.",
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
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "${gaMeasurementId}", { anonymize_ip: true });`}
            </Script>
          </>
        ) : null}
        <AppSessionProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Wordly",
                applicationCategory: "EducationApplication",
                operatingSystem: "Web Browser",
                description:
                  "Create custom, printable word search puzzles for classrooms, homes, and learning activities.",
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
