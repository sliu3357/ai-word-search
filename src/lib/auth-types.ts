import { DefaultSession } from "next-auth"
import { JWT } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      creditBalance: number
      subscriptionTier: string
    } & DefaultSession["user"]
  }
}

// next-auth v5 JWT类型扩展（直接和JWT类型合并声明）
declare module "next-auth" {
  interface JWT {
    id?: string
    role?: string
    creditBalance?: number
    subscriptionTier?: string
  }
}
