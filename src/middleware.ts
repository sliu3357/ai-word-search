/**
 * App-level middleware.
 *
 * VERCEL DEPLOYMENT PROTECTION BYPASS
 * ------------------------------------
 * The production deployment is currently behind Vercel Authentication
 * ("Require Log In" for all deployments). To keep the site publicly
 * accessible without requiring every visitor to have a Vercel account,
 * we use the official Protection Bypass for Automation mechanism:
 *   https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection#protection-bypass-for-automation
 *
 * The bypass secret can be provided either as the HTTP header
 * `x-vercel-protection-bypass` OR as a query parameter with the same name.
 * This middleware ensures every visitor gets it injected on the first
 * page visit, and then transparently applies it for all subsequent page
 * navigations AND API calls via a short-lived cookie + rewrite.
 *
 * Two env vars are consulted — Vercel's built-in system env var is named
 * VERCEL_AUTOMATION_BYPASS_SECRET; the project-local alias we support is
 * VERCEL_BYPASS_SECRET. Set either to the value from Vercel project
 * Settings → Deployment Protection → Protection Bypass for Automation.
 *
 * If the bypass secret is not set, the middleware is a no-op (useful for
 * local dev and for the day we fully disable Vercel Authentication).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BYPASS_PARAM = "x-vercel-protection-bypass"
const BYPASS_COOKIE = "__vb_bypass"

function isStaticAsset(p: string) {
  return (
    p.startsWith("/_next/") ||
    p.startsWith("/_vercel/") ||
    /\.(png|jpe?g|svg|gif|webp|ico|woff2?|css|js|map|txt|xml|webmanifest)$/i.test(p)
  )
}

/**
 * Vercel Authentication lives on Vercel's edge network, before Next.js runs.
 * So we cannot "set" the bypass on the response — the visitor's next request
 * must already carry it. We therefore:
 *
 *   Pages (GET/HEAD document requests):
 *     First visit  → redirect to same URL + `?x-vercel-protection-bypass=…`
 *                    and set a session cookie.
 *     Follow-up    → the cookie is already present, so we rewrite silently
 *                    to inject the query param again (URL bar stays clean).
 *
 *   API / asset / non-GET requests:
 *     We never redirect. We only inject via rewrite, but ONLY if the caller
 *     already holds the bypass cookie. In practice every in-page fetch()
 *     will, because the document visit above sets the cookie.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // ── Domain canonicalization: non-www → www ──────────────────────────
  // Vercel redirects wordsearchai.top → www.wordsearchai.top at the edge,
  // but this 308 redirect drops session cookies (different domain).
  // Handle the redirect in middleware so cookies are preserved from the start.
  const isProd = process.env.NODE_ENV === "production"
  if (isProd && host === "wordsearchai.top") {
    url.protocol = "https"
    url.host = "www.wordsearchai.top"
    return NextResponse.redirect(url, 308)
  }

  const secret =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || process.env.VERCEL_BYPASS_SECRET

  if (!secret) return NextResponse.next()

  const pathname = url.pathname
  const method = request.method.toUpperCase()

  if (isStaticAsset(pathname)) return NextResponse.next()
  if (request.headers.get("x-middleware-prefetch")) return NextResponse.next()

  const alreadyBypassedViaUrl = url.searchParams.get(BYPASS_PARAM) === secret
  const hasBypassCookie = request.cookies.get(BYPASS_COOKIE)?.value === "1"
  const isApi = pathname.startsWith("/api/")
  const isPageLike =
    !isApi && (method === "GET" || method === "HEAD" || method === "OPTIONS")

  // ── Case A: request already carries the bypass param ────────────────
  //   Pages: set the cookie so subsequent requests don't need it in the URL.
  //   APIs:  nothing to do.
  if (alreadyBypassedViaUrl) {
    const res = NextResponse.next()
    if (isPageLike) {
      res.cookies.set(BYPASS_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }
    return res
  }

  // ── Case B: caller already holds the bypass cookie ───────────────────
  //   Rewrite to inject the bypass query param. Vercel's edge layer sees
  //   the rewritten URL and lets the request through. Invisible to users.
  if (hasBypassCookie) {
    url.searchParams.set(BYPASS_PARAM, secret)
    return NextResponse.rewrite(url)
  }

  // ── Case C: first visit, no cookie, no param ────────────────────────
  //   Pages:  307 redirect → cookie set on next hit → silent rewrite forever after.
  //   APIs:   Let Vercel do its thing (401 / redirect to Vercel login).
  //           In practice, a human visitor never hits this first: the
  //           document request above will have set the cookie before any
  //           fetch() from that page fires. Direct API users (curl etc.)
  //           should provide the bypass header themselves as documented.
  if (isPageLike) {
    url.searchParams.set(BYPASS_PARAM, secret)
    return NextResponse.redirect(url, 307)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|_vercel|__nextjs|.*\\..*).*)"],
}
