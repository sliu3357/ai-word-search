import * as React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  /** Applied directly on the inner `container-app` wrapper (inside <main>). */
  containerClassName?: string
}

export function PageLayout({ children, className, containerClassName }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn("flex-1 py-8 md:py-12", className)}>
        <div className={cn("container-app", containerClassName)}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
