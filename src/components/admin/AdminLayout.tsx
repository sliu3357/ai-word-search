"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PageLayout } from "@/components/layout/PageLayout"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, Puzzle, ShieldCheck } from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/credits", label: "Credits Log", icon: CreditCard },
  { href: "/admin/puzzles", label: "Puzzles", icon: Puzzle },
] as const

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <PageLayout>
      <section className="border-b border-border bg-muted/30 -mx-4 md:-mx-8">
        <div className="container-app py-8 md:py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage users, credits, templates, and monitor site activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-app">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Sidebar */}
            <aside className="md:w-52 md:shrink-0">
              <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
                {ADMIN_NAV.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-secondary text-white shadow-sm"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
