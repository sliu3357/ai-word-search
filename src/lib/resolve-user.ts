import { getPrisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/**
 * 从 NextAuth session 解析出真正的数据库用户 ID。
 *
 * 问题背景：Google OAuth 登录时 session.user.id 可能是 Google 的账号 ID，
 * 而非数据库 users 表的主键。直接用它查数据库会返回 null。
 *
 * 此函数先按 ID 查，查不到再按 email 回退，确保返回的是数据库用户 ID。
 * 如果都无法匹配，返回 null。
 */
export async function resolveDbUserId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const prisma = await getPrisma()

  // 先按 session 中的 ID 查
  const byId = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
  if (byId) return byId.id

  // 回退：按 email 查
  if (session.user.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (byEmail) {
      console.log("[resolve-user] Found user via email fallback:", byEmail.id)
      return byEmail.id
    }
  }

  return null
}
