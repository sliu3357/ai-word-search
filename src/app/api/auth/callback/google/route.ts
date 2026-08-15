import { NextRequest } from "next/server"
import { handlers } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * Google OAuth 回调处理。
 *
 * Google 授权完成后会重定向回 /api/auth/callback/google?code=xxx&state=xxx
 * 为避免 [...nextauth] catch-all 路由再次触发 UnknownAction 错误，
 * 这里直接调用 NextAuth handlers，并显式传入 nextauth 参数模拟 catch-all 路由
 * 的解析结果（["callback", "google"]）。
 */
export async function GET(req: NextRequest) {
  return handlers.GET(req, {
    params: Promise.resolve({ nextauth: ["callback", "google"] }),
  })
}

export async function POST(req: NextRequest) {
  return handlers.POST(req, {
    params: Promise.resolve({ nextauth: ["callback", "google"] }),
  })
}
