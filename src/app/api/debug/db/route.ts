import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

/**
 * GET /api/debug/db — 临时诊断接口（安全起见只返回元数据，不含任何密码/token）
 * - env 变量是否存在及其协议前缀
 * - Prisma / Neon 适配器能否成功初始化
 * - 能否成功对 users 表做一次 SELECT 1
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ""
  const directUrl = process.env.DIRECT_URL || ""
  const prefix = (u: string) => (u ? `${u.split("://")[0]}://***` : "<unset>")

  try {
    const prisma = await getPrisma()
    const row: any = await prisma.$queryRawUnsafe("SELECT 1 AS ok").catch((e: any) => ({ err: String(e?.message || e).slice(0, 200) }))
    let usersCount: number | { err: string } = -1
    try {
      usersCount = await prisma.user.count()
    } catch (e: any) {
      usersCount = { err: String(e?.message || e).slice(0, 200) }
    }
    return NextResponse.json({
      ok: true,
      env: {
        DATABASE_URL: prefix(dbUrl),
        DIRECT_URL: prefix(directUrl),
      },
      queryResult: Array.isArray(row) ? row[0] : row,
      usersCount,
    })
  } catch (error: any) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    return NextResponse.json(
      {
        ok: false,
        env: {
          DATABASE_URL: prefix(dbUrl),
          DIRECT_URL: prefix(directUrl),
        },
        error: detail,
      },
      { status: 500 }
    )
  }
}
