import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * 管理员账号诊断端点：
 * 1. 输出数据库里所有用户的角色分布（不输出 email / passwordHash）
 * 2. 如果当前 session 是已登录用户，返回其本人的 role 情况
 *
 * 访问: GET /api/debug/admin-users
 */
export async function GET() {
  try {
    const prisma = await getPrisma()
    const totalUsers = await prisma.user.count()
    const roleBreakdown = await prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    })
    // 拿几个 sample id，方便确认是否有数据
    const sampleUsers = await prisma.user.findMany({
      take: 10,
      select: { id: true, role: true, email: false, passwordHash: false },
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
