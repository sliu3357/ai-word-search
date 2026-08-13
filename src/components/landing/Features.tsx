import {
  Type,
  FileText,
  Gamepad2,
  Library,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FEATURES = [
  {
    icon: Type,
    title: "Custom Words",
    description:
      "Input your own vocabulary words and create puzzles tailored to your lesson plan, study guide, or personal interests.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Printable PDF",
    description:
      "Download high-quality PDF files optimized for printing. Includes answer keys and multiple layout options for classrooms.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Gamepad2,
    title: "Play Online",
    description:
      "Solve puzzles interactively in the browser. Track your progress, time yourself, and share with friends or students.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Library,
    title: "Preset Libraries",
    description:
      "Choose from hundreds of curated word lists organized by grade level (K-12) and themes like animals, science, and holidays.",
    color: "bg-success/10 text-success",
  },
] as const

export function Features() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything You Need to Make Great Puzzles
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed for teachers, parents, and puzzle
            enthusiasts.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
