import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Heart,
  Lightbulb,
  Mail,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Us - Word Puzzle Generator",
  description:
    "Learn about Word Puzzle Generator — our mission, who we build for, and the small team behind the free word search maker used by teachers and parents worldwide.",
}

const VALUES = [
  {
    icon: Heart,
    title: "Built with care for teachers",
    description:
      "We've spent hundreds of hours talking to educators about what actually works in a classroom. Every feature — from difficulty levels to print formatting — is shaped by real teacher feedback.",
  },
  {
    icon: Lightbulb,
    title: "Learning should feel like play",
    description:
      "Kids retain more when they're having fun. We designed every puzzle to feel like a game, even while it quietly builds spelling, reading, and vocabulary skills.",
  },
  {
    icon: BookOpen,
    title: "Simple, fast, no signup needed",
    description:
      "We don't believe in long forms or paywalls for the basics. You can land on the maker, paste your words, and have a printable puzzle in under 60 seconds.",
  },
  {
    icon: Users,
    title: "For every learner, everywhere",
    description:
      "From homeschool kitchens to crowded city classrooms, our goal is to make quality word puzzle tools available to any teacher, parent, or student who needs them.",
  },
]

const TEAM_MEMBERS = [
  {
    name: "Jamie Chen",
    role: "Co-founder & Product Lead",
    bio: "Former elementary school teacher turned product designer. Jamie's classroom worksheets are the original inspiration for the generator.",
  },
  {
    name: "Ravi Patel",
    role: "Co-founder & Engineering Lead",
    bio: "Lifelong puzzle fan and software engineer. Ravi built the first placement algorithm and obsesses over generation speed and print quality.",
  },
  {
    name: "Maya Rodriguez",
    role: "Education Content Lead",
    bio: "Middle school literacy teacher and curriculum designer. Maya curates our graded template packs and seasonal themed word lists.",
  },
  {
    name: "Sam Okafor",
    role: "Customer & Community Lead",
    bio: "Support specialist and homeschool parent. Sam is the friendly voice behind every email reply and community forum post.",
  },
]

export default function AboutPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-light/40 to-background">
        <div className="container-app py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
              <Pencil className="h-4 w-4" />
              About Word Puzzle Generator
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              About Us
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              We are a tiny team on a mission to make it ridiculously easy for
              teachers and parents to turn any word list into beautiful,
              printable word search puzzles. No design skills, no signup, no
              hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/word-search-maker">
                  Try the Maker
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#contact">Say Hello</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="text-sm font-bold uppercase tracking-wide text-secondary">
                Our Mission
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                More puzzles, less prep time.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We started Word Puzzle Generator because one teacher we love
                was spending her weekends manually building word searches in a
                spreadsheet. That is silly. Teachers have better things to do,
                kids deserve more engaging practice, and learning should not
                feel like work for anyone involved.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                So we built a tool that turns a plain word list into a clean,
                printable puzzle in a few seconds. Today, hundreds of
                thousands of teachers, parents, and students around the world
                use the site every month.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {VALUES.map((value) => (
                <Card key={value.title} className="h-full">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <value.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wide text-secondary">
              Who We Serve
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for real people who teach kids
            </h2>
            <p className="mt-4 text-muted-foreground">
              We do not chase flashy enterprise features. We build for the
              folks actually handing worksheets to real kids every day.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                label: "Classroom Teachers",
                stat: "65%",
                blurb:
                  "Elementary, middle, and high school teachers using puzzles for vocabulary, spelling, and early-finisher work.",
              },
              {
                icon: Heart,
                label: "Parents & Homeschool",
                stat: "22%",
                blurb:
                  "Families doing at-home learning, family game nights, travel printables, and after-school enrichment.",
              },
              {
                icon: Sparkles,
                label: "Students & Self-Learners",
                stat: "13%",
                blurb:
                  "Kids, teens, and adults building their own study puzzles for language learning, test prep, and review.",
              },
            ].map((group) => (
              <Card key={group.label} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <group.icon className="h-6 w-6" />
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {group.stat}
                  </div>
                  <CardTitle className="mt-1 text-lg">{group.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{group.blurb}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wide text-secondary">
              The Team
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Small team, big enthusiasm
            </h2>
            <p className="mt-4 text-muted-foreground">
              We are a distributed team of four, united by a love of learning
              and a hatred of unnecessary busywork.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <Card key={member.name} className="h-full">
                <CardHeader>
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-secondary-light text-lg font-bold text-primary shadow-sm">
                    {member.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <CardTitle className="text-center text-lg">
                    {member.name}
                  </CardTitle>
                  <p className="text-center text-sm font-medium text-secondary">
                    {member.role}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-muted/30">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center shadow-lg sm:px-16">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                We would love to hear from you
              </h2>
              <p className="mt-4 text-primary-foreground/90">
                Bug reports, feature requests, template ideas, or just a
                friendly hello — we read every email personally.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <a href="mailto:hello@wordpuzzlegenerator.example">
                    Email Us
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/faq">Read the FAQ</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/80">
                Based in the U.S. • Replies within 1–2 business days
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
