import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const FREE_TIER_BENEFITS = [
  "Create unlimited puzzles",
  "5 free PDF downloads per day",
  "Access to all grade-level word lists",
  "No credit card required",
] as const

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 md:p-16">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4" />
                <span>Start for free</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                Start Creating Your Word
                <br />
                Puzzles Today
              </h2>

              <p className="max-w-lg text-lg text-white/80">
                Join thousands of teachers and parents making learning fun.
                Create your first puzzle in under 30 seconds.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full text-base text-primary sm:w-auto hover:bg-white/90"
                >
                  <Link href="/word-search-maker">
                    Start Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-transparent text-base text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm md:p-8">
              <div className="mb-6">
                <div className="text-sm font-medium text-white/70">
                  Free tier includes
                </div>
              </div>
              <ul className="space-y-4">
                {FREE_TIER_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="text-base text-white">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-white/20 bg-white/5 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-white/70">/ forever</span>
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Upgrade anytime for unlimited downloads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
