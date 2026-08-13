import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client"

let cachedPrisma: PrismaClientType | null = null

/**
 * 懒加载 PrismaClient（异步，使用 dynamic import）
 * 避免模块加载时立即触发 PrismaClient 构造，防止构建阶段和边缘环境报错
 *
 * NOTE: Prisma 7 requires a driver adapter. We use better-sqlite3 for local
 * SQLite development. When switching to Neon PostgreSQL, replace with
 * @prisma/adapter-pg (PrismaPg) and update the DATABASE_URL accordingly.
 */
export async function getPrisma(): Promise<PrismaClientType> {
  if (cachedPrisma) return cachedPrisma

  const mod = await import("@/generated/prisma/client")
  const PrismaClient = mod.PrismaClient as unknown as new (opts?: any) => PrismaClientType

  // Resolve the SQLite database file path from DATABASE_URL
  // DATABASE_URL format: "file:./dev.db" or "file:/absolute/path/to/dev.db"
  const rawUrl = process.env.DATABASE_URL || "file:./dev.db"
  const pathOnly = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl

  // Resolve to an absolute path (relative to process.cwd() if relative)
  // This handles relative paths and normalizes slashes for Windows
  const { resolve } = await import("node:path")
  const { existsSync } = await import("node:fs")
  const absolutePath = resolve(pathOnly)

  if (!existsSync(absolutePath)) {
    console.error(`[prisma] Database file not found at: ${absolutePath}`)
    throw new Error(`Database file not found: ${absolutePath}`)
  }

  try {
    // Prisma 7 requires a driver adapter — use better-sqlite3 for local SQLite
    // Pass the absolute path (without file: prefix) to the adapter
    const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3")
    const adapter = new PrismaBetterSqlite3({ url: absolutePath })
    cachedPrisma = new PrismaClient({ adapter } as any)
  } catch (e) {
    console.error("[prisma] Failed to initialize with better-sqlite3 adapter:", (e as Error).message)
    throw e
  }

  // 开发环境全局缓存避免热重启连接溢出
  if (process.env.NODE_ENV !== "production") {
    const g = globalThis as unknown as { __prisma?: PrismaClientType }
    if (!g.__prisma) g.__prisma = cachedPrisma
    cachedPrisma = g.__prisma
  }

  return cachedPrisma
}
