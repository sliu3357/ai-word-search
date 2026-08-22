import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

/**
 * GET /api/debug/db — 临时诊断接口（安全起见只返回元数据，不含任何密码/token）
 * - env 变量是否存在及其协议前缀
 * - Prisma / Neon 适配器能否成功初始化
 * - 能否成功对 users 表做一次 SELECT 1
 * - 各关键表的 count 查询（用于诊断表是否存在）
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ""
  const directUrl = process.env.DIRECT_URL || ""
  const prefix = (u: string) => (u ? `${u.split("://")[0]}://***` : "<unset>")

  const safeCount = async (name: string, fn: () => Promise<number>): Promise<number | { err: string }> => {
    try {
      return await fn()
    } catch (e: any) {
      return { err: String(e?.message || e).slice(0, 300) }
    }
  }

  try {
    const prisma = await getPrisma()
    const row: any = await prisma.$queryRawUnsafe("SELECT 1 AS ok").catch((e: any) => ({ err: String(e?.message || e).slice(0, 200) }))

    const [usersCount, creditsCount, subsCount, puzzlesCount] = await Promise.all([
      safeCount("users", () => prisma.user.count()),
      safeCount("credit_transactions", () => prisma.creditTransaction.count()),
      safeCount("subscriptions", () => prisma.subscription.count()),
      safeCount("puzzle_histories", () => prisma.puzzleHistory.count()),
    ])

    let creditTxColumns: any[] | { err: string } = []
    try {
      creditTxColumns = await prisma.$queryRawUnsafe(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'credit_transactions' ORDER BY ordinal_position`
      ) as any[]
    } catch (e: any) {
      creditTxColumns = { err: String(e?.message || e).slice(0, 300) }
    }

    let sampleCreditTx: any[] | { err: string } = []
    try {
      sampleCreditTx = await prisma.$queryRawUnsafe(
        `SELECT * FROM credit_transactions LIMIT 1`
      ) as any[]
    } catch (e: any) {
      sampleCreditTx = { err: String(e?.message || e).slice(0, 300) }
    }

    return NextResponse.json({
      ok: true,
      env: {
        DATABASE_URL: prefix(dbUrl),
        DIRECT_URL: prefix(directUrl),
      },
      queryResult: Array.isArray(row) ? row[0] : row,
      tables: {
        users: usersCount,
        credit_transactions: creditsCount,
        subscriptions: subsCount,
        puzzle_histories: puzzlesCount,
      },
      credit_transactions_columns: creditTxColumns,
      credit_transactions_sample: sampleCreditTx,
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
