import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Baby,
  GraduationCap,
  Rocket,
  School,
  Sparkles,
  Star,
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
  title: "Word Search for Kids - Fun Vocabulary Learning Games",
  description:
    "Fun word search puzzles for kids! Age-appropriate vocabulary learning games for ages 5-14. Colorful, printable word searches that make learning feel like play.",
}

const AGE_GROUPS = [
  {
    ageRange: "Ages 5-7",
    gradeHint: "Kindergarten to Grade 2",
    icon: Baby,
    color: "bg-pink-100 text-pink-700",
    accent: "from-pink-200 to-rose-200",
    examples: ["Animals", "Colors", "Numbers", "Shapes", "Body parts"],
    difficulty: "Short words (2-6 letters) • Horizontal & vertical only • UPPERCASE",
    sampleWords: ["CAT", "DOG", "SUN", "RED", "FISH", "TREE", "BALL", "CAKE"],
  },
  {
    ageRange: "Ages 8-10",
    gradeHint: "Grade 3 to Grade 5",
    icon: School,
    color: "bg-amber-100 text-amber-700",
    accent: "from-amber-200 to-yellow-200",
    examples: ["Science words", "Fruit & veggies", "Geography", "Sports", "Habitats"],
    difficulty: "Medium words (3-10 letters) • Optional diagonals • Mixed case",
    sampleWords: ["ELEPHANT", "BANANA", "FOREST", "MEXICO", "SOCCER", "ROBOT", "PUPPY", "GARDEN"],
  },
  {
    ageRange: "Ages 11-14",
    gradeHint: "Grade 6 to Grade 9",
    icon: GraduationCap,
    color: "bg-sky-100 text-sky-700",
    accent: "from-sky-200 to-indigo-200",
    examples: ["Academic vocab", "History terms", "Literature", "Biology", "Foreign language"],
    difficulty: "Longer words (4-15 letters) • Diagonals & backwards • Challenge mode",
    sampleWords: ["ECOSYSTEM", "RENAISSANCE", "MITOCHONDRIA", "HYPOTHESIS", "ALLEGORY", "ISOSCELES", "CIRCUMFERENCE", "PHOTOSYNTHESIS"],
  },
]

const FUN_BENEFITS = [
  {
    icon: Star,
    title: "Makes Learning Fun",
    description:
      "Kids don't even realize they're practicing spelling and reading. Every puzzle feels like a game, not a worksheet.",
  },
  {
    icon: Rocket,
    title: "Builds Vocabulary",
    description:
      "Discover new words through themed puzzles — dinosaurs, space, animals, science, and so many more.",
  },
  {
    icon: Sparkles,
    title: "Boosts Confidence",
    description:
      "Finding words one by one gives kids quick, repeated wins — building confidence in reading and spelling.",
  },
]

export default function ForKidsPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-pink-100/50 via-amber-50/40 to-background">
        <div className="container-app py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-pink-600 shadow-sm">
              <Star className="h-4 w-4" />
              Word Search Fun for Kids
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Word Search for{" "}
              <span className="bg-gradient-to-r from-pink-500 via-amber-500 to-sky-500 bg-clip-text text-transparent">
                Kids
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Colorful, playful word searches that make spelling, reading, and
              vocabulary feel like a game. Pick an age group, print or play
              online, and watch them have fun while they learn.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/word-search-maker">
                  Make a Kids Puzzle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/for-teachers">For Parents & Teachers</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free to play • Printable puzzles • Safe for kids (no ads in puzzles)
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Puzzles for every age and stage
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether your child is just learning to read or is ready for a
              challenge, we have the perfect difficulty level.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {AGE_GROUPS.map((group) => (
              <Card
                key={group.ageRange}
                className="relative h-full overflow-hidden"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${group.accent}`}
                  aria-hidden
                />
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                    <group.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{group.ageRange}</CardTitle>
                  <CardDescription className="font-medium text-foreground/80">
                    {group.gradeHint}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Great Themes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.examples.map((ex) => (
                        <span
                          key={ex}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${group.color}`}
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Difficulty
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {group.difficulty}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Try These Words
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.sampleWords.map((w) => (
                        <span
                          key={w}
                          className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono text-foreground"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/word-search-generator">
                      Make {group.ageRange} Puzzles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why kids love word searches
            </h2>
            <p className="mt-4 text-muted-foreground">
              It is not just fun — it is real skill-building disguised as a game.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FUN_BENEFITS.map((item) => (
              <Card key={item.title} className="h-full text-center">
                <CardHeader>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-amber-500 to-sky-500 px-6 py-16 text-center shadow-lg sm:px-16">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to play?
              </h2>
              <p className="mt-4 text-white/90">
                Pick a theme or make your own puzzle with your favorite words.
                Parents and teachers: you can print it, too!
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/word-search-maker">
                    Start a Kids Word Search
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/for-teachers">For Parents & Teachers</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
