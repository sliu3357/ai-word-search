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
 * - postgresql://... URLs use @prisma/adapter-neon (Prisma 7.x API: pass a
 *   PoolConfig directly — PrismaNeon manages its own Pool internally)
 * - file:... URLs fall back to @prisma/adapter-better-sqlite3 for local dev
 *
 * NOTE on Prisma 7 @prisma/adapter-neon API change:
 *   BEFORE (adapter <= 0.x):  new PrismaNeon(poolInstance)
 *   AFTER  (adapter ~= 7.x):  new PrismaNeon(poolConfigObject)
 * Passing a pre-built Pool instance yields undefined host/user/db since the
 * adapter iterates the config looking for PoolConfig keys like `connectionString`.
 */
async function createAdapterFor(url: string): Promise<any> {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    // Import only the types; @prisma/adapter-neon will internally import
    // @neondatabase/serverless Pool when it calls connect().
    const { PrismaNeon } = await import("@prisma/adapter-neon")
    return new PrismaNeon({ connectionString: url })
  }

  // Local SQLite fallback
  // NOTE: Avoid static string `await import("@prisma/adapter-better-sqlite3")`
  // because Turbopack eagerly resolves ALL import() literal strings during build,
  // even when the branch is unreachable in production (Neon/PostgreSQL path),
  // causing a hard Module-not-found build failure after we remove that package
  // from the manifest (to avoid Vercel native node-gyp install crashes).
  //
  // Solution: construct the package name at runtime + use Node require()
  // (which is purely runtime and opaque to the Turbopack static analyzer).
  // Local SQLite devs who need the adapter can install it on demand via:
  //   `npm i -D better-sqlite3 @prisma/adapter-better-sqlite3`
  const { resolve } = await import("node:path")
  const { existsSync } = await import("node:fs")
  const raw = url.startsWith("file:") ? url.slice(5) : url
  const absolutePath = resolve(raw)
  if (!existsSync(absolutePath)) {
    throw new Error(`[prisma] SQLite DB not found: ${absolutePath}`)
  }
  const pkgSegments: string[] = ["@prisma", "adapter-better-sqlite3"]
  const adapterPkg = pkgSegments.join("/") // runtime-constructed string
  let adapterMod: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    adapterMod = require(adapterPkg)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(
      `[prisma] SQLite adapter not installed. To use local SQLite (file:) dev database, run:\n` +
      `  npm i -D better-sqlite3 @prisma/adapter-better-sqlite3\n\n` +
      `Underlying error: ${msg}`
    )
  }
  const PrismaBetterSqlite3 = adapterMod.PrismaBetterSqlite3
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
