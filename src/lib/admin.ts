import { auth } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

/** 检查当前用户是否为管理员，返回 session + prisma 或 null */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return null
  }
  const prisma = await getPrisma()
  return { session, prisma }
}
