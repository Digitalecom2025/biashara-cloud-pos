/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require("node:child_process");

const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
const args = isPostgres
  ? ["prisma", "generate", "--schema", "prisma/schema.postgresql.prisma"]
  : ["prisma", "generate"];

const result = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
