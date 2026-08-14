import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // For prisma CLI (migrate deploy / db push), prefer DIRECT_URL when
  // provided by Neon (a non-pooled connection that supports schema-altering
  // transactions). Otherwise fall back to DATABASE_URL.
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
