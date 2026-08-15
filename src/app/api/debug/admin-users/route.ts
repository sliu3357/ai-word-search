import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { seedAdminIfNeeded } from "@/lib/admin"

export const dynamic = "force-dynamic"

/**
 * 管理员账号诊断端点：
 * 0. 主动尝试一次 seed（读环境变量升级/创建管理员），方便验证配置是否生效
 * 1. 输出数据库里所有用户的角色分布（不输出 email / passwordHash）
 * 2. 如果当前 session 是已登录用户，返回其本人的 role 情况
 *
 * 访问: GET /api/debug/admin-users
 */
export async function GET() {
  try {
    // 主动触发一次 seed，便于验证 env var 是否被正确读取
    let seedTried = false
    let seedResult: any = "skipped"
    try {
      seedTried = true
      await seedAdminIfNeeded()
      seedResult = "ok"
    } catch (se: any) {
      seedResult = { error: (se as Error).message }
    }
    const prisma = await getPrisma()
    const totalUsers = await prisma.user.count()
    const roleBreakdown = await prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    })
    // 拿几个 sample id + 邮箱脱敏摘要（前 3 字符 + 域名），方便确认 promote 是否命中
    const sampleUsersRaw = await prisma.user.findMany({
      take: 20,
      select: { id: true, role: true, email: true, passwordHash: false },
    })
    const sampleUsers = sampleUsersRaw.map((u) => {
      const [local, domain] = u.email.split("@")
      const maskedLocal = local.slice(0, Math.min(3, local.length)) + "…"
      return {
        id: u.id.slice(0, 8) + "...",
        role: u.role,
        emailMasked: `${maskedLocal}@${domain ?? "?"}`,
      }
    })

    let me: any = null
    try {
      const session = await auth()
      if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, role: true, email: false, passwordHash: false },
        })
        me = { sessionRole: session.user.role, dbRole: dbUser?.role ?? null }
      }
    } catch {
      me = { error: "session decode failed" }
    }

    return NextResponse.json({
      ok: true,
      seedTried,
      seedResult,
      // 把管理员相关 env 摘要也打出来（只打印长度，不泄露值）
      adminEnv: {
        ADMIN_PROMOTE_EMAIL: process.env.ADMIN_PROMOTE_EMAIL
          ? `len=${process.env.ADMIN_PROMOTE_EMAIL.length}`
          : "MISSING",
        ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL
          ? `len=${process.env.ADMIN_SEED_EMAIL.length}`
          : "MISSING",
        ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD
          ? `len=${process.env.ADMIN_SEED_PASSWORD.length}`
          : "MISSING",
      },
      promoteTargetMasked: (() => {
        const pe = (process.env.ADMIN_PROMOTE_EMAIL || "").trim().toLowerCase()
        if (!pe) return null
        const [local, domain] = pe.split("@")
        return `${local.slice(0, Math.min(3, local.length))}…@${domain ?? "?"}`
      })(),
      totalUsers,
      roleBreakdown: roleBreakdown.map((r) => ({
        role: r.role,
        count: r._count._all,
      })),
      sampleUserIdsAndRoles: sampleUsers.map((u) => ({
        id: u.id.slice(0, 8) + "...",
        role: u.role,
      })),
      currentSession: me,
      hint:
        totalUsers === 0
          ? "数据库中没有任何用户，需先注册。管理员账号需要通过环境变量 ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD 初始化，或直接手动在数据库里设置 role='admin'。"
          : !roleBreakdown.some((r) => r.role === "admin")
            ? "数据库中没有 role=admin 的用户，需要把某个用户的 role 改为 admin。"
            : "已有管理员用户，问题可能出在登录流程（credentials provider / session 回调）。",
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        errName: err?.name ?? "UnknownError",
        errMessage: err?.message ?? String(err),
      },
      { status: 500 }
    )
  }
}
