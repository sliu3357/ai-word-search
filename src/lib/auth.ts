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
  // PrismaAdapter 接受 PrismaClient 或 Promise<PrismaClient>，见文档
  return PrismaAdapter(prismaPromise as unknown as PrismaClientType)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-ignore adapter 可以接受 Promise 包裹的 prisma 客户端
  adapter: getAdapter(),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
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
  ],
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
