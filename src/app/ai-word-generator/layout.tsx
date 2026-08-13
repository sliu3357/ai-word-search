import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Word Generator - Create Word Banks From Any Scene",
  description:
    "Describe a scene or topic (e.g. 'a trip to the beach') and our AI instantly builds a kid-friendly word bank. Choose Easy/Medium/Hard and turn it into a printable word search puzzle.",
  keywords: [
    "ai word generator",
    "word bank generator",
    "scene to words",
    "vocabulary maker",
    "kids word search ai",
    "speech to word list",
    "printable word search generator",
  ],
  openGraph: {
    title: "AI Word Generator - Create Word Banks From Any Scene",
    description:
      "Type or speak a scene, pick a difficulty, and get a ready-to-use English word bank for a printable word search puzzle.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Word Generator for Kids Word Searches",
    description:
      "Describe a scene (or say it!) and get custom word banks for children's word search puzzles.",
  },
}

export default function AiWordGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
