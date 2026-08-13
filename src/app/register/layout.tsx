import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create your free account - Word Puzzle Generator",
  description:
    "Sign up free for Word Puzzle Generator and get 50 credits to start creating custom word search puzzles. Save puzzles, sync across devices, and more.",
  robots: { index: false, follow: false },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
