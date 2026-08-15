import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getPrisma } from "@/lib/prisma"
import { seedAdminIfNeeded } from "@/lib/admin"
import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client"

/**
 * 懒加载 prisma + PrismaAdapter
 * NextAuth 在调用时才会真正初始化 adapter，避免构建时报错
 */
function getAdapter() {
  const prismaPromise = getPrisma()
  return PrismaAdapter(prismaPromise as unknown as PrismaClientType)
}

function hasValidGoogleCredentials() {
  const id = process.env.AUTH_GOOGLE_ID
  const secret = process.env.AUTH_GOOGLE_SECRET
  if (!id || !secret) return false
  if (id === "placeholder" || secret === "placeholder") return false
  return id.length > 0 && secret.length > 0
}

export const googleEnabled = hasValidGoogleCredentials()
if (!googleEnabled && process.env.NODE_ENV !== "test") {
  console.warn(
    "[auth] Google OAuth is disabled because AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are missing or still set to placeholder. Set both environment variables and redeploy to enable Google sign-in."
  )
}

// 环境变量诊断（只打印长度，不打印原值），方便定位 Vercel 部署问题
if (process.env.NODE_ENV !== "test") {
  const summary: Record<string, string> = {
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? `len=${process.env.AUTH_GOOGLE_ID.length}` : "MISSING",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? `len=${process.env.AUTH_GOOGLE_SECRET.length}` : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? `len=${process.env.AUTH_SECRET.length}` : "MISSING",
    AUTH_TRUST_HOST: String(process.env.AUTH_TRUST_HOST ?? "MISSING"),
    AUTH_DEBUG: String(process.env.AUTH_DEBUG ?? "MISSING"),
    AUTH_URL: process.env.AUTH_URL ? `len=${process.env.AUTH_URL.length}` : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? `len=${process.env.NEXTAUTH_URL.length}` : "MISSING",
    VERCEL: String(process.env.VERCEL ?? "MISSING"),
    VERCEL_URL: process.env.VERCEL_URL ? `len=${process.env.VERCEL_URL.length}` : "MISSING",
    NODE_ENV: process.env.NODE_ENV ?? "MISSING",
  }
  console.log("[auth] env summary:", JSON.stringify(summary))
}

const trustHost =
  String(process.env.AUTH_TRUST_HOST ?? "").toLowerCase() === "true" ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.VERCEL_URL)

const providers: any[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      try {
        const prisma = await getPrisma()
        const email = (credentials.email as string).toLowerCase().trim()
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      } catch (e) {
        console.error("[auth authorize] Error:", (e as Error).message)
        return null
      }
    },
  }),
]

if (googleEnabled) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

// 显式传入 url，确保 NextAuth 计算 redirect_uri 时用 https:// 前缀
const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || undefined

export const { handlers: rawHandlers, auth, signIn, signOut } = NextAuth({
  // 全开 debug，直到 Google 登录问题解决
  debug: true,
  // 临时去掉 adapter 排查 Configuration 错误
  // // @ts-ignore adapter 可以接受 Promise 包裹的 prisma 客户端
  // adapter: getAdapter(),
  trustHost,
  ...(authUrl ? { url: authUrl } : {}),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  // 不要加 events.error，这个版本的 next-auth v5 类型里没有 error 事件
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      // 确保至少有一个管理员（如果环境变量配置了的话）。
      // 在 jwt 回调里触发，保证用户登录后 /admin 页面可用。
      try {
        await seedAdminIfNeeded()
      } catch (e) {
        console.warn("[auth jwt] seedAdminIfNeeded skipped:", (e as Error).message)
      }
      if (token.email) {
        try {
          const prisma = await getPrisma()
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.creditBalance = dbUser.creditBalance
            token.subscriptionTier = dbUser.subscriptionTier
          }
        } catch (e) {
          // Prisma 未就绪时忽略
          console.warn("[auth jwt] prisma not ready:", (e as Error).message)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id
        session.user.role = (token.role as string) ?? "user"
        session.user.creditBalance = (token.creditBalance as number) ?? 0
        session.user.subscriptionTier =
          (token.subscriptionTier as string) ?? "free"
      }
      return session
    },
  },
})

/**
 * 包一层 NextAuth handlers，捕获所有 handler 级抛出的错误（包括 Configuration）
 * 用独特前缀 [NEXT_AUTH_FATAL_GET] / [NEXT_AUTH_FATAL_POST] 打日志，
 * 这样在 Vercel Runtime Logs 里一搜就能看到真正的错误原因。
 */
async function wrapHandler(
  name: "GET" | "POST",
  req: any,
  ctx: any,
  original: (req: any, ctx: any) => Promise<Response> | Response
): Promise<Response> {
  // 收集 NextAuth debug 模式打印的 console 日志
  const collected: string[] = []
  const origLog = console.log
  const origError = console.error
  const origWarn = console.warn
  const collect = (args: any[], prefix: string) => {
    try {
      const msg = args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" ")
      collected.push(`[${prefix}] ${msg.slice(0, 500)}`)
    } catch {}
  }
  console.log = (...args: any[]) => { collect(args, "log"); origLog(...args) }
  console.error = (...args: any[]) => { collect(args, "error"); origError(...args) }
  console.warn = (...args: any[]) => { collect(args, "warn"); origWarn(...args) }

  try {
    const resp = await original(req, ctx)
    // 检查是否 redirect 到 error 页面
    const location = resp?.headers?.get?.("location") ?? resp?.headers?.get?.("Location")
    if (location && /\/api\/auth\/error/.test(location)) {
      const body = JSON.stringify({
        interceptedError: true,
        method: name,
        requestUrl: typeof req?.url === "string" ? req.url : String(req?.url ?? ""),
        redirectLocation: location,
        adapterDisabled: true,
        consoleLogCount: collected.length,
        consoleLogs: collected.slice(-30),
        hint: "NextAuth 返回 redirect 到 error 页面，下方 consoleLogs 含 debug 模式输出",
      }, null, 2)
      origError(`[NEXT_AUTH_REDIRECT_TO_ERROR_${name}] location=${location} logs=${collected.length}`)
      return new Response(body, {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }
    return resp
  } catch (err: any) {
    const body = JSON.stringify({
      caughtException: true,
      method: name,
      errName: err?.name ?? "UnknownError",
      errMessage: err?.message ?? String(err),
      errStack: (err?.stack ?? "").slice(0, 3000),
      errCause: String((err as any)?.cause ?? ""),
      consoleLogCount: collected.length,
      consoleLogs: collected.slice(-30),
    }, null, 2)
    origError(`[NEXT_AUTH_FATAL_${name}] name=${err?.name} | message=${err?.message}`)
    return new Response(body, {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  } finally {
    console.log = origLog
    console.error = origError
    console.warn = origWarn
  }
}

export const handlers = {
  GET: (req: any, ctx: any) => wrapHandler("GET", req, ctx, rawHandlers.GET),
  POST: (req: any, ctx: any) => wrapHandler("POST", req, ctx, rawHandlers.POST),
}
