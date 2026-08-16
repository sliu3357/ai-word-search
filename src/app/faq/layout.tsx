import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Word Search FAQ – Help for Teachers, Parents & Kids",
  description:
    "Find answers about making, printing, playing, and sharing free word search puzzles with Wordly.",
  alternates: { canonical: "/faq" },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the word search generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Wordly offers a free plan for creating and printing word search puzzles.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account to make a puzzle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You can start creating a word search puzzle without an account.",
      },
    },
    {
      "@type": "Question",
      name: "Can I print or download my puzzle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Generated puzzles can be printed or exported for later use.",
      },
    },
  ],
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
