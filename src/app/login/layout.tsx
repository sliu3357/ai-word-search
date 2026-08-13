import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log in - Word Puzzle Generator",
  description:
    "Log in to your Word Puzzle Generator account to save puzzles and access premium features.",
  robots: { index: false, follow: false },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
