import Link from "next/link"

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/word-search-maker", label: "Word Search Maker" },
      { href: "/word-search-generator", label: "Word Search Templates" },
      { href: "/ai-word-generator", label: "AI Word Generator" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "By Grade",
    links: [
      { href: "/grade/pre-k", label: "Pre-K Word Search" },
      { href: "/grade/kindergarten", label: "Kindergarten Word Search" },
      { href: "/grade/first-grade", label: "1st Grade Word Search" },
      { href: "/grade/second-grade", label: "2nd Grade Word Search" },
    ],
  },
  {
    title: "By Theme",
    links: [
      { href: "/theme/animals", label: "Animal Word Search" },
      { href: "/theme/food", label: "Food Word Search" },
      { href: "/theme/science", label: "Science Word Search" },
      { href: "/theme/geography", label: "Geography Word Search" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/for-kids", label: "For Kids" },
      { href: "/for-teachers", label: "For Teachers" },
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-[var(--mint)] no-print">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="space-y-3 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-[22px] font-extrabold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[24px] text-primary" aria-hidden="true">✦</span>
              <span>Wordly</span>
            </Link>
            <p className="text-[14px] text-[#54707a] leading-relaxed">
              Create custom word search puzzles with your own vocabulary words.
              Free, printable, and ready for the classroom or home.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-[13px] font-extrabold tracking-wide text-foreground uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[#54707a] font-semibold transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6">
          <p className="text-center text-[13px] text-[#54707a]">
            &copy; {year} Wordly · Made with ❤️ for little learners
          </p>
        </div>
      </div>
    </footer>
  )
}
