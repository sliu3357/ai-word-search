import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Word Search Maker - Create Custom Puzzles Free",
  description:
    "Create custom word search puzzles with your own vocabulary words. Free, printable, and ready for the classroom or home. Choose grid size, directions, and difficulty.",
  keywords: [
    "word search maker",
    "custom word search",
    "word puzzle generator",
    "printable word search",
    "vocabulary worksheet maker",
  ],
}

export default function WordSearchMakerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
