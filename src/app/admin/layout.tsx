import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - Word Puzzle Generator",
  description:
    "Manage users, credits, templates, and monitor site activity.",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
