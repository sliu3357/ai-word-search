import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Breadcrumbs, JsonLd } from "@/components/seo"
import { cn } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wordsearchai.top"

export const metadata: Metadata = {
  title: "Pricing - Word Puzzle Generator",
  description:
    "Simple, transparent pricing for Word Puzzle Generator. Free tier with monthly credits, Basic and Pro plans for unlimited puzzles and premium features.",
  alternates: {
    canonical: `${baseUrl}/pricing`,
  },
}

interface Plan {
  name: string
  price: string
  period: string
  credits: string
  savedPuzzles: string
  features: string[]
  highlighted?: boolean
  ctaLabel: string
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    credits: "50 credits/mo",
    savedPuzzles: "100 saved puzzles",
    features: [
      "50 puzzle generations per month",
      "Up to 40 words per puzzle",
      "Printable & HTML download",
      "100 saved puzzles",
      "Basic difficulty settings",
      "Standard grid sizes",
      "Community support",
    ],
    ctaLabel: "Get Started",
  },
  {
    name: "Basic",
    price: "$4.99",
    period: "/mo",
    credits: "200 credits/mo",
    savedPuzzles: "500 saved puzzles",
    features: [
      "200 puzzle generations per month",
      "Up to 40 words per puzzle",
      "PDF export with answer keys",
      "No watermark on puzzles",
      "500 saved puzzles",
      "All difficulty settings",
      "Custom grid sizes",
      "Priority email support",
    ],
    highlighted: true,
    ctaLabel: "Get Started",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    credits: "Unlimited credits",
    savedPuzzles: "Unlimited saved",
    features: [
      "Unlimited puzzle generations",
      "Up to 40 words per puzzle",
      "PDF export with answer keys",
      "No watermark on puzzles",
      "Unlimited saved puzzles",
      "Premium & seasonal templates",
      "Online interactive play mode",
      "Priority email & chat support",
      "Bulk puzzle generation",
    ],
    ctaLabel: "Get Started",
  },
]

export default function PricingPage() {
  // Product 结构化数据（每个付费方案作为 Offer）
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Word Puzzle Generator",
    description:
      "Custom word search puzzle generator with printable PDF, online play, and preset templates for teachers and kids.",
    brand: { "@type": "Brand", name: "Wordly" },
    url: `${baseUrl}/pricing`,
    offers: PLANS.filter((p) => p.price !== "$0").map((plan) => ({
      "@type": "Offer",
      name: `${plan.name} Plan`,
      price: plan.price.replace("$", ""),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.price.replace("$", ""),
        priceCurrency: "USD",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
      },
      url: `${baseUrl}/pricing`,
      availability: "https://schema.org/InStock",
    })),
  }

  return (
    <PageLayout>
      <JsonLd data={productSchema} id="ld-product-pricing" />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ]}
      />
      <section className="border-b border-border bg-muted/30">
        <div className="container-app py-14 text-center md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />
            Simple, Transparent Pricing
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free and upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-app">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex h-full flex-col",
                  plan.highlighted &&
                    "border-primary shadow-lg ring-2 ring-primary/20 lg:-my-4 lg:shadow-2xl"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    Perfect for{" "}
                    {plan.name === "Free"
                      ? "trying out the puzzle maker."
                      : plan.name === "Basic"
                      ? "teachers and parents making puzzles regularly."
                      : "schools, tutors, and power users who need it all."}
                  </CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-success" />
                      {plan.credits}
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Check className="h-4 w-4 text-success" />
                      {plan.savedPuzzles}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    <Link href="/word-search-maker">
                      {plan.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            All plans include access to the word search maker. Prices in USD.
            Need a school or district plan?{" "}
            <Link
              href="/about"
              className="font-medium text-primary hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </PageLayout>
  )
}
