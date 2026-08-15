import { handlers } from "@/lib/auth"
import { NextRequest } from "next/server"

// Next.js 16: params 是 Promise，必须 await 后才能读取
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth?: string[] }> }
) {
  const params = await ctx.params
  return handlers.GET(req, { params })
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth?: string[] }> }
) {
  const params = await ctx.params
  return handlers.POST(req, { params })
}
