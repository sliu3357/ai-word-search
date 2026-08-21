"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/seo"
import { cn } from "@/lib/utils"
import { FAQS } from "@/lib/faq-data"
import type { FaqItem } from "@/lib/faq-data"

function FaqAccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card transition-all",
        isOpen && "shadow-sm ring-1 ring-primary/10"
      )}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="text-base font-semibold text-foreground">
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <PageLayout>
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "FAQ", url: "/faq" },
        ]}
      />
      <section className="border-b border-border bg-muted/30">
        <div className="container-app py-14 text-center md:py-20">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            FAQ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Answers to the most common questions about making, printing, and
            sharing word search puzzles.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-app">
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((faq, index) => (
              <FaqAccordionItem
                key={faq.question}
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() => toggle(index)}
              />
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-3xl rounded-xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Still have questions?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try the Word Search Maker for free, or reach out to our team —
              we are happy to help.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/word-search-maker">
                  Try the Maker
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/about">About & Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
