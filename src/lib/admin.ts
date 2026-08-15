import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

let seedPromise: Promise<void> | null = null

/**
 * 幂等初始化管理员账号（安全版，无硬编码）。
 *
 * 支持两种模式（二选一或同时使用，优先 promote 模式）：
 *  1) ADMIN_PROMOTE_EMAIL   —— 把已注册的某个普通用户升级为 admin（推荐）
 *  2) ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD —— 如果 admin 不存在则创建一个
 *     带密码的管理员账号（首次部署或数据库为空时使用）
 *
 * 规则：
 *  - 数据库里已有 role=admin 的用户 → 直接 return，什么都不做。
 *  - 环境变量缺失 → 直接 return，保持现状（不要抛错影响用户登录）。
 *  - 只执行一次：通过模块级 Promise memo，并发调用时也只跑一轮。
 *  - 不打印邮箱和密码，只输出长度等脱敏信息。
 */
export async function seedAdminIfNeeded(): Promise<void> {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    try {
      const prisma = await getPrisma()

      // 1. 如果已经有管理员，直接返回
      const adminCount = await prisma.user.count({ where: { role: "admin" } })
      if (adminCount > 0) return

      const promoteEmail = (process.env.ADMIN_PROMOTE_EMAIL || "").trim().toLowerCase()
      const seedEmail = (process.env.ADMIN_SEED_EMAIL || "").trim().toLowerCase()
      const seedPassword = process.env.ADMIN_SEED_PASSWORD || ""

      // 2. 两个 env 都没填 → 静默 return
      if (!promoteEmail && !seedEmail) return

      // Mode A: promote 已存在用户
      if (promoteEmail) {
        const target = await prisma.user.findUnique({
          where: { email: promoteEmail },
          select: { id: true, role: true },
        })
        if (!target) {
          console.warn(
            `[admin seed] ADMIN_PROMOTE_EMAIL=${promoteEmail.slice(0, 3)}… 未找到匹配用户，跳过 promote`
          )
        } else if (target.role !== "admin") {
          await prisma.user.update({
            where: { id: target.id },
            data: { role: "admin" },
          })
          console.log(
            `[admin seed] ✅ 已把用户 ${target.id.slice(0, 8)}… 升级为 admin（promote）`
          )
          return
        }
      }

      // Mode B: 创建新的管理员账号
      if (seedEmail && seedPassword) {
        if (seedPassword.length < 6) {
          console.warn(
            `[admin seed] ADMIN_SEED_PASSWORD 长度只有 ${seedPassword.length}，至少需要 6 位，跳过 create`
          )
          return
        }
        const existing = await prisma.user.findUnique({
          where: { email: seedEmail },
          select: { id: true, role: true },
        })
        if (existing) {
          if (existing.role !== "admin") {
            await prisma.user.update({
              where: { id: existing.id },
              data: { role: "admin" },
            })
            console.log(
              `[admin seed] ✅ 用户已存在，已升级为 admin（email=${seedEmail.slice(0, 3)}…）`
            )
          }
          return
        }
        const passwordHash = await bcrypt.hash(seedPassword, 10)
        const created = await prisma.user.create({
          data: {
            email: seedEmail,
            passwordHash,
            role: "admin",
            creditBalance: 99999,
            subscriptionTier: "pro",
            subscriptionStatus: "active",
          },
          select: { id: true },
        })
        await prisma.creditTransaction.create({
          data: {
            userId: created.id,
            amount: 99999,
            type: "gift",
            description: "Admin initial credit grant",
          },
        })
        console.log(
          `[admin seed] ✅ 已创建管理员账号 id=${created.id.slice(0, 8)}…（email=${seedEmail.slice(0, 3)}…，pw_len=${seedPassword.length}）`
        )
      }
    } catch (e) {
      // Prisma 没就绪时不抛错，只记录。不要因为 seed 失败阻塞整个登录流程。
      console.warn("[admin seed] 初始化失败，已跳过：", (e as Error).message)
    }
  })()
  return seedPromise
}

/** 检查当前用户是否为管理员，返回 session + prisma 或 null。
 *  调用时顺带执行管理员 seed，保证部署后首次访问就有 admin。
 */
export async function requireAdmin() {
  await seedAdminIfNeeded()
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return null
  }
  const prisma = await getPrisma()
  return { session, prisma }
}
