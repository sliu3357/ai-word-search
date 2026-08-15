import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getPrisma } from "@/lib/prisma"
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 全开 debug，直到 Google 登录问题解决
  debug: true,
  // @ts-ignore adapter 可以接受 Promise 包裹的 prisma 客户端
  adapter: getAdapter(),
  trustHost,
  ...(authUrl ? { url: authUrl } : {}),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  events: {
    error(error) {
      try {
        console.error(
          "[NEXT_AUTH_FATAL] kind=" + (error as any)?.kind +
          " | name=" + error?.name +
          " | message=" + error?.message +
          " | cause=" + String((error as any)?.cause ?? "") +
          " | stack=" + (error?.stack ?? "").slice(0, 2000)
        )
      } catch (e2) {
        console.error("[NEXT_AUTH_FATAL_BAIL]", String(error), e2)
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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
