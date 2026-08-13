import type { Metadata } from "next"
import { Shield, Mail } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy - Word Puzzle Generator",
  description:
    "How Word Puzzle Generator collects, uses, and protects your personal information when you create word search puzzles and use our services.",
}

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: [
      "We collect minimal information needed to run the service:",
      "Account information: your email address and an optional display name when you register.",
      "Puzzle data: the word lists, puzzle settings, and generated puzzles you save to your account.",
      "Usage data: aggregated, non-identifying analytics about which features are used and how the site performs.",
      "We do NOT collect payment details directly — billing is handled securely by our payment provider (Stripe).",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    body: [
      "To provide the word search generator and save your puzzles so you can return to them.",
      "To authenticate your account and keep your data private to you.",
      "To understand which features are popular so we can improve the product.",
      "To send essential service emails (e.g., password reset, account notices). We will never sell your email or send marketing spam.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Authentication",
    body: [
      "We use a secure session cookie to keep you logged in as you move between pages. This cookie does not track you across other websites.",
      "We use a CSRF token to protect form submissions from cross-site request forgery.",
      "We do not use advertising or third-party tracking cookies.",
    ],
  },
  {
    id: "data-storage",
    title: "Data Storage & Security",
    body: [
      "Your data is stored in a managed PostgreSQL database with encryption at rest.",
      "Passwords are hashed with bcrypt before storage — we never see or store your plain-text password.",
      "Access to production data is restricted to a small number of team members and only for troubleshooting.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: [
      "You can view and update your account information in Settings at any time.",
      "You can delete your account and associated puzzle data by contacting us.",
      "You can request a copy of the personal data we hold about you.",
      "If you are in the EU or UK, you have rights under the GDPR. Contact us to exercise them.",
    ],
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    body: [
      "Our service is designed to be used by teachers and parents creating puzzles for children. We do not knowingly collect personal information directly from children under 13.",
      "Accounts are created by adults (teachers, parents, or older students). We recommend parents and teachers supervise children's use of the site.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. When we do, we will update the 'last updated' date at the top of this page and notify users of significant changes via email.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-light/40 to-background">
        <div className="container-app py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
              <Shield className="h-4 w-4" />
              Last updated: August 6, 2026
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Your privacy matters. This policy explains what we collect, why we
              collect it, and how we keep it safe.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-app">
          <div className="mx-auto max-w-3xl space-y-10">
            <p className="text-base leading-relaxed text-muted-foreground">
              Word Puzzle Generator (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;the service&rdquo;) is a tool for teachers and parents to
              create printable word search puzzles. This Privacy Policy explains
              how we handle your information when you use our website and
              services.
            </p>

            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((para, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0 && section.body.length > 1
                          ? "text-base leading-relaxed text-muted-foreground"
                          : "ml-4 text-base leading-relaxed text-muted-foreground before:content-['•'] before:mr-2 before:text-secondary"
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Questions about privacy?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We are happy to help with any privacy request or concern.
              </p>
              <Button asChild className="mt-5">
                <a href="mailto:hello@wordpuzzlegenerator.example">
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
