import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Word Puzzle Generator",
  description:
    "Answers to frequently asked questions about the Word Puzzle Generator. How to create puzzles, print, use custom words, pricing, account questions, and more.",
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
