import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function ensureMigrations() {
  if (process.env.SKIP_DB_MIGRATE === "1") {
    console.log("Skipping database migrations (SKIP_DB_MIGRATE=1)");
    return;
  }

  console.log("Applying database migrations...");
  execSync("npx prisma migrate deploy --schema=server/prisma/schema.prisma", {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
  console.log("Database migrations complete.");
}
