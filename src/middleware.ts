/**
 * Next.js 16 推荐使用 proxy 代替 middleware
 * 这里暂时保留空逻辑，避免构建时触发 auth.js 的副作用
 * 如需实际保护路由，可在 proxy 或页面级检查
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
