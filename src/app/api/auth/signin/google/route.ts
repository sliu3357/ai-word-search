import { NextRequest } from "next/server"
import { signIn } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * 专门处理 Google OAuth 登录入口。
 *
 * 背景：Next.js 16 + next-auth v5 beta 下，/api/auth/[...nextauth] catch-all
 * 路由会抛出 "UnknownAction: Unsupported action" 错误。Next.js 路由优先级
 * 让静态路由 /api/auth/signin/google 优先于 [...nextauth] 匹配，
 * 因此这里直接调用服务端 signIn() 函数，绕过 catch-all 的 action 解析。
 *
 * 流程：浏览器 GET /api/auth/signin/google?callbackUrl=... →
 *   signIn('google', { redirectTo }) 返回 302 redirect 到 accounts.google.com
 */
export async function GET(req: NextRequest) {
  const callbackUrl =
    req.nextUrl.searchParams.get("callbackUrl") ||
    req.nextUrl.searchParams.get("redirectTo") ||
    "/dashboard"
  return signIn("google", { redirectTo: callbackUrl })
}
