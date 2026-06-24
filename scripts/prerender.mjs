// Post-build prerender: gerçek headless Chrome ile SPA'yı render edip
// statik HTML snapshot'ları üretir. Crawler'lar artık dolu içerik görür.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { blogPosts } from "../src/data/blogPosts.js";
import { landingPages } from "../src/data/landingPages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = 5099;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split("?")[0]);
        let filePath = path.join(DIST, urlPath);
        if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");

        if (!existsSync(filePath) || filePath.endsWith(path.sep)) {
          // SPA fallback
          filePath = path.join(DIST, "index.html");
        }
        const ext = path.extname(filePath);
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        // istenen dosya yoksa SPA fallback
        try {
          const data = await readFile(path.join(DIST, "index.html"));
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(data);
        } catch {
          res.writeHead(404);
          res.end("Not found");
        }
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

// { route: snapshot için açılacak path, lang: zorlanacak dil, out: dist içindeki çıktı yolu }
const TARGETS = [
  { route: "/", lang: "tr", out: "index.html" },
  { route: "/tr/", lang: "tr", out: "tr/index.html" },
  { route: "/en/", lang: "en", out: "en/index.html" },
  // Blog yazıları — her dil için ayrı statik sayfa
  ...blogPosts.flatMap((post) => [
    { route: `/blog/${post.slug}`, lang: "tr", out: `blog/${post.slug}/index.html` },
    { route: `/en/blog/${post.slug}`, lang: "en", out: `en/blog/${post.slug}/index.html` },
  ]),
  ...landingPages.flatMap((page) => [
    { route: `/${page.slug}`, lang: "tr", out: `${page.slug}/index.html` },
    { route: `/en/${page.slug}`, lang: "en", out: `en/${page.slug}/index.html` },
  ]),
];

async function run() {
  if (!existsSync(DIST)) {
    console.error("dist/ bulunamadı. Önce `vite build` çalıştırın.");
    process.exit(1);
  }

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const target of TARGETS) {
      const page = await browser.newPage();
      // Snapshots only need the rendered DOM. Blocking heavy media and remote
      // resources prevents map, video and font requests from stalling builds.
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const type = request.resourceType();
        const url = request.url();
        if (["media", "font"].includes(type) || (!url.startsWith(`http://localhost:${PORT}`) && type !== "document")) {
          request.abort();
        } else {
          request.continue();
        }
      });
      // Snapshot öncesi başlangıç dilini garanti et
      await page.evaluateOnNewDocument((lang) => {
        try {
          localStorage.setItem("viptransfer-lang", lang);
        } catch {}
      }, target.lang);

      await page.goto(`http://localhost:${PORT}${target.route}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      // Ana içeriğin render olmasını bekle
      await page.waitForSelector("section#home, .blogpost, .landing-page", { timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);

      const outPath = path.join(DIST, target.out);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, html, "utf-8");
      console.log(`✓ prerendered ${target.route} → dist/${target.out}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
