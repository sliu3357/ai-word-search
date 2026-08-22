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

// Same as run() but returns a status instead of exiting — for non-critical
// steps like "prisma migrate deploy" whose failure should not block the
// overall build (e.g. transient DB connectivity / already-applied migrations).
function runSoft(cmd, args = [], opts = {}) {
  log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (result.status !== 0) {
    logWarn(`Non-critical step exited with code ${result.status} — continuing build anyway.`);
    return { ok: false, status: result.status };
  }
  return { ok: true, status: 0 };
}

function isPostgresUrl(url) {
  return typeof url === "string" && (url.startsWith("postgresql://") || url.startsWith("postgres://"));
}

// 1. prisma generate (always)
log("Step 1/3: prisma generate");
run("npx", ["prisma", "generate"]);

// 2. prisma migrate deploy (production / Vercel only)
log("Step 2/3: prisma migrate deploy");
const directUrl = process.env.DIRECT_URL ?? "";
const dbUrl = process.env.DATABASE_URL ?? "";

const maskUrl = (url) => {
  if (!url) return "MISSING";
  if (url.length <= 20) return `${url.slice(0, 8)}... (len=${url.length})`;
  return `${url.slice(0, 12)}...${url.slice(-6)} (len=${url.length})`;
};

log(`DIRECT_URL = ${maskUrl(directUrl)} | DATABASE_URL = ${maskUrl(dbUrl)}`);

// CRITICAL: prisma migrate deploy MUST use a DIRECT_URL (non-pooled, plain
// PostgreSQL) because pooled / PgBouncer connections (typical DATABASE_URL on
// Neon/Vercel) do not support schema-altering transactions. Using DATABASE_URL
// as fallback for migrate deploy leads to Prisma P1015 errors. Therefore we
// ONLY execute migrate deploy when DIRECT_URL is explicitly configured and
// points to a postgresql:// endpoint (not a pooled one).
const migrateUrl = isPostgresUrl(directUrl) ? directUrl : "";

if (migrateUrl) {
  log(`PostgreSQL DIRECT_URL detected. Running prisma migrate deploy (non-critical — failure will NOT block build)...`);
  runSoft("npx", ["prisma", "migrate", "deploy"]);
} else if (process.env.NODE_ENV === "production") {
  logWarn(
    "Production build but no valid PostgreSQL DIRECT_URL configured. Skipping prisma migrate deploy. For Neon/Vercel production, set DIRECT_URL to the NON-POOLED (direct) PostgreSQL endpoint, NOT the pooled/PgBouncer one."
  );
} else {
  log(
    `Local dev (non-postgresql DIRECT_URL detected: ${
      dbUrl.startsWith("file:") ? "SQLite" : "unknown"
    }). Skipping prisma migrate deploy.`
  );
}

// 3. next build
log("Step 3/3: next build");
run("npx", ["next", "build"]);

log("✅ Build completed successfully.");
