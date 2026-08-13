import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Account - Word Puzzle Generator",
  description:
    "Manage your credits, view purchase history, and update your account settings.",
  robots: { index: false, follow: false },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
