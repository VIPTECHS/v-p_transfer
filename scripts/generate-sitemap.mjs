import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSitemapXml } from "./sitemap.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemap = buildSitemapXml();

await writeFile(path.join(ROOT, "public", "sitemap.xml"), sitemap, "utf-8");

const distPath = path.join(ROOT, "dist");
if (existsSync(distPath)) {
  await mkdir(distPath, { recursive: true });
  await writeFile(path.join(distPath, "sitemap.xml"), sitemap, "utf-8");
}

console.log("✓ generated public/sitemap.xml from the public route data");
if (existsSync(distPath)) console.log("✓ generated dist/sitemap.xml");
