import { NextResponse } from "next/server"
import { googleEnabled } from "@/lib/auth"

export const dynamic = "force-dynamic"

export function GET() {
  const summary: Record<string, string> = {
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? `len=${process.env.AUTH_GOOGLE_ID.length}` : "MISSING",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? `len=${process.env.AUTH_GOOGLE_SECRET.length}` : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? `len=${process.env.AUTH_SECRET.length}` : "MISSING",
    AUTH_TRUST_HOST: String(process.env.AUTH_TRUST_HOST ?? "MISSING"),
    AUTH_URL: process.env.AUTH_URL ?? "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    VERCEL: String(process.env.VERCEL ?? "MISSING"),
    VERCEL_URL: process.env.VERCEL_URL ?? "MISSING",
    NODE_ENV: process.env.NODE_ENV ?? "MISSING",
  }
  return NextResponse.json({
    googleEnabled: !!googleEnabled,
    trustHostComputed:
      String(process.env.AUTH_TRUST_HOST ?? "").toLowerCase() === "true" ||
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.VERCEL_URL),
    env: summary,
  })
}
