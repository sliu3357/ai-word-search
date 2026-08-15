import { NextResponse } from "next/server"
import { googleEnabled } from "@/lib/auth"

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({
    googleEnabled: !!googleEnabled,
    credentialsEnabled: true,
  })
}
