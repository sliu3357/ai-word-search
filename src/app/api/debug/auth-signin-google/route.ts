import { NextResponse } from "next/server"
import { handlers } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * 诊断端点：直接调用 NextAuth /api/auth/signin/google handler，把真实的 Response/Error 原样返回。
 * 访问: GET /api/debug/auth-signin-google
 */
export async function GET(request: Request) {
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://www.wordsearchai.top"
  // 构造一个伪造的 signin 请求
  const fakeUrl = `${authUrl.replace(/\/$/, "")}/api/auth/signin/google`
  const headers = new Headers(request.headers)
  // 保证 Host 与 authUrl 一致
  try {
    const u = new URL(authUrl)
    headers.set("host", u.host)
    headers.set("x-forwarded-proto", u.protocol.replace(":", ""))
  } catch {}

  const fakeReq = new Request(fakeUrl, {
    method: "GET",
    headers,
  })

  const ctx = { params: Promise.resolve({ nextauth: ["signin", "google"] }) } as any

  try {
    // @ts-ignore 调用 NextAuth handlers.GET
    const resp = await handlers.GET(fakeReq, ctx)
    const respObj: any = {
      ok: true,
      status: resp?.status ?? "NO_STATUS",
      location: resp?.headers?.get("location") ?? null,
      contentType: resp?.headers?.get("content-type") ?? null,
      setCookies: resp?.headers?.getSetCookie ? resp.headers.getSetCookie() : null,
    }
    // 如果是 redirect 到 google，说明 provider 配置成功
    if (respObj.location && /accounts\.google\.com/.test(respObj.location)) {
      respObj.hint = "✅ redirect 到 Google，provider 配置生效！"
      // 把 location 里的非敏感参数（scope/redirect_uri）抓出来，redirect_uri 只打印长度
      try {
        const lu = new URL(respObj.location)
        respObj.parsedRedirectParams = {
          client_id_present: !!lu.searchParams.get("client_id"),
          scope: lu.searchParams.get("scope"),
          state_len: (lu.searchParams.get("state") || "").length,
          nonce_len: (lu.searchParams.get("nonce") || "").length,
          redirect_uri_len: (lu.searchParams.get("redirect_uri") || "").length,
          redirect_uri_prefix: (lu.searchParams.get("redirect_uri") || "").slice(0, 32) + "...",
          response_type: lu.searchParams.get("response_type"),
        }
      } catch {}
    } else if (respObj.location && /\/api\/auth\/error/.test(respObj.location)) {
      respObj.hint = "❌ NextAuth 返回了 Configuration 错误"
    }
    return NextResponse.json(respObj, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        errName: err?.name ?? "UnknownError",
        errMessage: err?.message ?? String(err),
        errStack: (err?.stack ?? "").slice(0, 3000),
      },
      { status: 500 }
    )
  }
}
