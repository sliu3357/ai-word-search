import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Puzzles - Word Puzzle Generator",
  description:
    "View your saved word search puzzles and game history. Reload, edit, or export anytime.",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
