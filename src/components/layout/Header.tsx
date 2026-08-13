"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Sparkles, User, LogOut, Settings, ChevronDown, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/ai-word-generator", label: "AI Generator" },
  { href: "/word-search-maker", label: "Maker" },
  { href: "/word-search-generator", label: "Templates" },
  { href: "/#how-it-works", label: "How It Works" },
] as const

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  // 点击外部关闭用户菜单
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 处理登出
  const handleLogout = async () => {
    setUserMenuOpen(false)
    await signOut({ redirect: false })
    router.push("/")
  }

  const isLoggedIn = status === "authenticated" && !!session?.user
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() ||
    session?.user?.email?.charAt(0)?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print">
      <div className="container-app flex h-18 items-center justify-between py-3">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[28px] font-extrabold text-foreground"
          onClick={() => setMobileOpen(false)}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-[30px] text-primary" aria-hidden="true">✦</span>
          <span>Wordly</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[15px] font-bold text-foreground/80 transition-colors hover:text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ============ Desktop right: 根据登录状态显示 ============ */}
        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              {/* Credits pill - 只在登录后显示 */}
              <span className="credits-pill">
                <Sparkles className="h-4 w-4" />
                {session?.user?.creditBalance ?? 0} Credits
              </span>

              {/* User menu dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white text-sm font-bold">
                    {userInitial}
                  </div>
                  <ChevronDown className="h-4 w-4 text-foreground/60" />
                </button>

                {/* 下拉菜单 */}
                <div
                  className={cn(
                    "absolute right-0 top-12 w-56 rounded-2xl border border-border bg-card py-2 shadow-lg transition-all",
                    userMenuOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  )}
                >
                  {/* 用户信息 */}
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>

                  {/* 菜单项 */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors mt-1"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>My Puzzles</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <div className="my-1 h-px bg-border mx-3" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 未登录：只显示一个 Sign in 按钮 */
            <Button
              asChild
              className="btn-pop rounded-[15px] bg-primary text-white hover:bg-primary font-extrabold px-5 h-11 border-0"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-foreground hover:bg-muted lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-in-out",
          mobileOpen ? "max-h-[600px]" : "max-h-0"
        )}
      >
        <nav className="container-app flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-3 text-base font-medium text-foreground/85 hover:text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {/* 移动端 Credits 显示 */}
                <span className="credits-pill self-start">
                  <Sparkles className="h-4 w-4" />
                  {session?.user?.creditBalance ?? 0} Credits
                </span>
                {/* 移动端用户信息 */}
                <div className="rounded-xl bg-muted/50 px-4 py-3 mt-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl h-11 font-medium mt-2"
                >
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    My Puzzles
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl h-11 font-medium"
                >
                  <Link href="/settings" onClick={() => setMobileOpen(false)}>
                    <Settings className="h-4 w-4 mr-2" />
                    My Account
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  variant="outline"
                  className="rounded-xl h-11 font-medium text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              /* 移动端未登录：只显示一个 Sign in 按钮 */
              <Button
                asChild
                className="rounded-xl h-11 bg-primary hover:bg-primary/90 text-white font-semibold mt-2"
              >
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
