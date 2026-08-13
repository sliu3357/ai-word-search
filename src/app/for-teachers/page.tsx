import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Word Search Maker for Teachers - Free Classroom Resources",
  description:
    "Free word search maker designed for teachers. Create custom vocabulary, spelling, and themed word searches for your classroom in seconds. Printable and ready for class.",
}

const USE_CASES = [
  {
    icon: BookOpen,
    title: "Classroom Activities",
    description:
      "Keep early finishers engaged or create whole-class word hunt activities. Custom puzzles make any lesson more interactive and fun.",
    points: [
      "Warm-up & bell ringer activities",
      "Early finisher challenge sheets",
      "Whole-class word hunt games",
      "End-of-unit review fun",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Homework & Worksheets",
    description:
      "Build printable homework packets in seconds. Differentiate difficulty per student group, and print as many copies as you need.",
    points: [
      "Weekly spelling word practice",
      "Vocabulary review worksheets",
      "Homework packets with answer keys",
      "Substitute teacher activity packs",
    ],
  },
  {
    icon: Lightbulb,
    title: "Vocabulary & Spelling Tests",
    description:
      "Turn word lists into low-pressure assessments. Students stay focused, and you get a fun way to check retention of new terms.",
    points: [
      "Spelling list review games",
      "Chapter vocabulary checks",
      "Foreign language word practice",
      "Content-area terminology review",
    ],
  },
  {
    icon: Users,
    title: "Themed Units & Holidays",
    description:
      "Make holidays, seasons, and special topics memorable. Build a themed puzzle in minutes — from dinosaurs to biomes to space exploration.",
    points: [
      "Holiday & seasonal activities",
      "Science & social studies themes",
      "Book or novel companion puzzles",
      "Back-to-school & end-of-year fun",
    ],
  },
]

export default function ForTeachersPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-light/40 to-background">
        <div className="container-app py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
              <GraduationCap className="h-4 w-4" />
              Made for Teachers
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Word Search Maker for Teachers
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Create beautiful, custom word search puzzles for your classroom
              in seconds. Perfect for spelling, vocabulary, review, and rainy
              day activities. Free to start — no signup required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/word-search-maker">
                  Make a Classroom Puzzle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See Pricing for Schools</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Printable PDF • Answer keys included • Up to 40 words per puzzle
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Use it for every part of your day
            </h2>
            <p className="mt-4 text-muted-foreground">
              From bell ringers to homework, word searches make every lesson
              feel a little more like play.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {USE_CASES.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-0.5 text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container-app">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  stat: "40",
                  label: "Words per puzzle",
                  sub: "Enough for any word list",
                },
                {
                  stat: "3",
                  label: "Difficulty levels",
                  sub: "Differentiate easily",
                },
                {
                  stat: "1-click",
                  label: "Print or download",
                  sub: "Ready for the copier",
                },
              ].map((item) => (
                <Card key={item.label} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold text-primary">
                      {item.stat}
                    </CardTitle>
                    <CardDescription className="font-medium text-foreground">
                      {item.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center shadow-lg sm:px-16">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Make your next classroom puzzle today
              </h2>
              <p className="mt-4 text-primary-foreground/90">
                Paste your spelling list, vocabulary terms, or themed words
                and generate a printable puzzle in seconds. Your students will
                love it.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/word-search-maker">
                    Go to Word Search Maker
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/pricing">Upgrade for Your School</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
