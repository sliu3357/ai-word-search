import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client"

let cachedPrisma: PrismaClientType | null = null

/**
 * Resolve the runtime database URL.
 * - Neon pooler connections are preferred at runtime (DATABASE_URL)
 * - When running locally against SQLite (file:...), fall back to that path
 * - Throws only when no URL is configured AND we aren't in a pure build-only context
 */
function resolveDatabaseUrl(): string {
  const runtime = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (runtime) return runtime
  // Local SQLite default for dev convenience
  const fallback = "file:./dev.db"
  if (process.env.NODE_ENV !== "production") return fallback
  throw new Error(
    "[prisma] Missing DATABASE_URL. Configure Neon pooled URL in env."
  )
}

/**
 * Build a Prisma driver adapter for the resolved URL.
 * - postgresql://... URLs use @prisma/adapter-neon + @neondatabase/serverless
 *   (Neon serverless driver; works over HTTPS, good for Vercel/Edge too)
 * - file:... URLs fall back to @prisma/adapter-better-sqlite3 for local dev
 */
async function createAdapterFor(url: string): Promise<any> {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    const { Pool, neon } = await import("@neondatabase/serverless")
    const { PrismaNeon } = await import("@prisma/adapter-neon")
    // Pool is recommended by Neon for long-lived server contexts;
    // neon() is fine for short lived invocations — Pool is API-compatible
    // with the adapter and keeps websocket/HTTPS sessions warm.
    const pool = new Pool({ connectionString: url })
    return new PrismaNeon(pool as any)
  }

  // Local SQLite fallback
  const { resolve } = await import("node:path")
  const { existsSync } = await import("node:fs")
  const raw = url.startsWith("file:") ? url.slice(5) : url
  const absolutePath = resolve(raw)
  if (!existsSync(absolutePath)) {
    throw new Error(`[prisma] SQLite DB not found: ${absolutePath}`)
  }
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3")
  return new PrismaBetterSqlite3({ url: absolutePath })
}

export async function getPrisma(): Promise<PrismaClientType> {
  if (cachedPrisma) return cachedPrisma

  const mod = await import("@/generated/prisma/client")
  const PrismaClient = mod.PrismaClient as unknown as new (opts?: any) => PrismaClientType

  const url = resolveDatabaseUrl()
  let prisma: PrismaClientType
  try {
    const adapter = await createAdapterFor(url)
    prisma = new PrismaClient({ adapter } as any)
  } catch (e) {
    console.error("[prisma] Failed to initialize adapter:", (e as Error).message)
    throw e
  }

  cachedPrisma = prisma

  if (process.env.NODE_ENV !== "production") {
    const g = globalThis as unknown as { __prisma?: PrismaClientType }
    if (!g.__prisma) g.__prisma = cachedPrisma
    cachedPrisma = g.__prisma
  }

  return cachedPrisma
}
