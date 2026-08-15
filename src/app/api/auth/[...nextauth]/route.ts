import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// Next.js 16: params 是 Promise，必须 await 后才能读取
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth?: string[] }> }
) {
  const params = await ctx.params
  // 临时诊断：返回 params 值
  const debug = {
    handler: "GET",
    url: req.url,
    method: req.method,
    paramsType: typeof params,
    paramsKeys: Object.keys(params),
    nextauth: params?.nextauth,
    nextauthType: typeof params?.nextauth,
    nextauthLength: params?.nextauth?.length,
  }
  // 如果 nextauth 不存在或为空，直接返回诊断信息
  if (!params?.nextauth || params.nextauth.length === 0) {
    return NextResponse.json({ routeDebug: debug, error: "nextauth params missing" }, { status: 500 })
  }
  return handlers.GET(req, { params })
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth?: string[] }> }
) {
  const params = await ctx.params
  return handlers.POST(req, { params })
}
