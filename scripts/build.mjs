#!/usr/bin/env node
/**
 * Safe build script for local dev + Vercel production:
 * 1. Always run `prisma generate` first (creates client at src/generated/prisma).
 * 2. Run `prisma migrate deploy` ONLY when a valid PostgreSQL DIRECT_URL (or
 *    DATABASE_URL fallback) is configured (production / Vercel Neon scenario).
 *    Skip silently on local SQLite (DATABASE_URL=file:./...) to avoid P1013.
 * 3. Finally run `next build`.
 */
import { spawnSync } from "node:child_process";

const log = (...args) => console.log("[build]", ...args);
const logWarn = (...args) => console.warn("[build][warn]", ...args);
const logError = (...args) => console.error("[build][error]", ...args);

function run(cmd, args = [], opts = {}) {
  log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (result.status !== 0) {
    logError(`Command failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
  return result;
}

function isPostgresUrl(url) {
  return typeof url === "string" && (url.startsWith("postgresql://") || url.startsWith("postgres://"));
}

// 1. prisma generate (always)
log("Step 1/3: prisma generate");
run("npx", ["prisma", "generate"]);

// 2. prisma migrate deploy (production / Vercel only)
log("Step 2/3: prisma migrate deploy");
const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const dbUrl = process.env.DATABASE_URL ?? "";

// Prefer DIRECT_URL for migrate (Neon: non-pooled connection supports
// schema-altering transactions). Fall back to DATABASE_URL if no DIRECT_URL.
const migrateUrl = isPostgresUrl(process.env.DIRECT_URL)
  ? process.env.DIRECT_URL
  : isPostgresUrl(process.env.DATABASE_URL)
    ? process.env.DATABASE_URL
    : "";

if (migrateUrl) {
  log(`PostgreSQL connection detected. Running prisma migrate deploy...`);
  run("npx", ["prisma", "migrate", "deploy"]);
} else if (process.env.NODE_ENV === "production") {
  logWarn(
    "Production build but no valid PostgreSQL DIRECT_URL/DATABASE_URL found. Skipping prisma migrate deploy. If this is Neon/Vercel production, configure DIRECT_URL env variable and redeploy."
  );
  logWarn(
    "Currently: DIRECT_URL =",
    directUrl ? `${directUrl.slice(0, 16)}... (len=${directUrl.length})` : "MISSING",
    "| DATABASE_URL =",
    dbUrl ? `${dbUrl.slice(0, 16)}... (len=${dbUrl.length})` : "MISSING"
  );
} else {
  log(
    `Local dev (non-postgresql DATABASE_URL detected: ${
      dbUrl.startsWith("file:") ? "SQLite" : "unknown"
    }). Skipping prisma migrate deploy.`
  );
}

// 3. next build
log("Step 3/3: next build");
run("npx", ["next", "build"]);

log("✅ Build completed successfully.");
