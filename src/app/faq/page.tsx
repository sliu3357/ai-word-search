"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// metadata is defined in layout.tsx (this is a client component)

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "Is the word search generator free to use?",
    answer:
      "Yes! The Free plan lets you create and print word search puzzles at no cost. You get 50 credits per month, up to 40 words per puzzle, and can save up to 100 puzzles in your account. If you need more, upgrade to Basic or Pro for additional credits and features.",
  },
  {
    question: "Do I need to create an account to make a puzzle?",
    answer:
      "No account is required to start. Just go to the Word Search Maker, enter your words, and generate a puzzle. Creating a free account will let you save your puzzles, sync them across devices, and keep track of your remaining credits.",
  },
  {
    question: "How many words can I put in a single puzzle?",
    answer:
      "You can include up to 40 words per puzzle. Each word should be between 2 and 35 letters long. Numbers and symbols are automatically filtered out — only letters are used. Tip: short-to-medium words place more reliably than very long ones.",
  },
  {
    question: "Can I print or download my puzzle?",
    answer:
      "Absolutely. Every puzzle has a Print button that opens your browser's print dialog, formatted for A4 and Letter paper. You can also download the puzzle as an HTML file to print later, or save it directly to your account as a PDF (Basic / Pro plans).",
  },
  {
    question: "How do I see the answer key for a puzzle?",
    answer:
      "After generating a puzzle, click the 'Show Answers' button above the grid. All placed words will be highlighted so you can grade student work or check your own. Click 'Hide Answers' to return to the normal puzzle view.",
  },
  {
    question: "Why are some of my words not placed in the grid?",
    answer:
      "The generator tries its best to place every word, but sometimes the grid runs out of room or there are too many conflicts. Long words especially are harder to fit. You'll see unplaced words listed after you generate. Try enabling diagonals and backward placement, reducing the number of long words, or generating again — the placement is randomized each time.",
  },
  {
    question: "What difficulty options are there?",
    answer:
      "You can switch between UPPERCASE and lowercase letters, restrict words to horizontal and vertical only, add diagonals, or allow backwards words for a harder challenge. Font size (Small / Medium / Large) and paper size (A4 / Letter) are also adjustable in the paid plans.",
  },
  {
    question: "Can I use these puzzles in my classroom or school?",
    answer:
      "Yes. Free, Basic, and Pro plans all include classroom use for individual teachers. If you need a school- or district-wide license with team billing, bulk puzzle generation, or custom branding, please contact us about a team plan.",
  },
]

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
