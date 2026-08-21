"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/layout/PageLayout"
import { MyCredits } from "@/components/settings/MyCredits"
import { MyOrders } from "@/components/settings/MyOrders"
import { cn } from "@/lib/utils"
import { CreditCard, ShoppingBag, Sparkles, Loader2 } from "lucide-react"

type TabId = "credits" | "orders"

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "credits", label: "My Credits", icon: <CreditCard className="h-4 w-4" /> },
  { id: "orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
]

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageLayout>
      }
    >
      <SettingsPageContent />
    </React.Suspense>
  )
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = React.useState<TabId>(() => {
    const tab = searchParams.get("tab") as TabId | null
    return tab === "orders" ? "orders" : "credits"
  })

  return (
    <PageLayout>
      <section className="border-b border-border bg-muted/30 -mx-4 md:-mx-8">
        <div className="container-app py-10 md:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
              <Sparkles className="h-4 w-4" />
              Account
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              My Account
            </h1>
            <p className="mt-3 text-muted-foreground">
              Manage your credits, view purchase history, and track your subscriptions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-app">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Sidebar */}
            <aside className="md:w-56 md:shrink-0">
              <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-secondary text-white shadow-sm"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {activeTab === "credits" ? <MyCredits /> : <MyOrders />}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}