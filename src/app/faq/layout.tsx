import type { Metadata } from "next"
import { JsonLd } from "@/components/seo"
import { FAQS } from "@/lib/faq-data"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

export const metadata: Metadata = {
  title: "FAQ - Word Puzzle Generator",
  description:
    "Answers to frequently asked questions about the Word Puzzle Generator. How to create puzzles, print, use custom words, pricing, account questions, and more.",
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
}

// FAQPage 结构化数据（Google 搜索富片段展示）
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <JsonLd data={faqSchema} id="ld-faq" />
      {children}
    </>
  )
}
