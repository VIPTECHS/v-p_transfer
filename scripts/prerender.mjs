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
import { sitePages } from "../src/data/sitePages.js";

const SITE_URL = "https://viptransfer.com";

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
  { route: "/de/", lang: "de", out: "de/index.html" },
  { route: "/deneyim", lang: "tr", out: "deneyim/index.html" },
  // Blog yazıları — her dil için ayrı statik sayfa
  ...blogPosts.flatMap((post) => [
    { route: `/blog/${post.slug}`, lang: "tr", out: `blog/${post.slug}/index.html` },
    { route: `/en/blog/${post.slug}`, lang: "en", out: `en/blog/${post.slug}/index.html` },
    { route: `/de/blog/${post.slug}`, lang: "de", out: `de/blog/${post.slug}/index.html` },
  ]),
  ...landingPages.flatMap((page) => [
    { route: `/${page.slug}`, lang: "tr", out: `${page.slug}/index.html` },
    { route: `/en/${page.slug}`, lang: "en", out: `en/${page.slug}/index.html` },
    { route: `/de/${page.slug}`, lang: "de", out: `de/${page.slug}/index.html` },
  ]),
  ...sitePages.flatMap((page) => [
    { route: `/${page.slug}`, lang: "tr", out: `${page.slug}/index.html` },
    { route: `/en/${page.slug}`, lang: "en", out: `en/${page.slug}/index.html` },
    { route: `/de/${page.slug}`, lang: "de", out: `de/${page.slug}/index.html` },
  ]),
];

function routeLang(route) {
  const m = route.match(/^\/(en|de)(\/|$)/);
  return m ? m[1] : "tr";
}

function contentKey(route) {
  const normalized = route.endsWith("/") && route !== "/" ? route.slice(0, -1) : route;
  const withoutLang = normalized.replace(/^\/(en|de)(?=\/)/, "") || "/";
  return withoutLang === "" ? "/" : withoutLang;
}

function absoluteRoute(route) {
  if (route === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${route.startsWith("/") ? route : `/${route}`}`;
}

function buildSitemapXml(targets) {
  const lastmod = new Date().toISOString().split("T")[0];
  const groups = new Map();

  for (const target of targets) {
    const key = contentKey(target.route);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(target);
  }

  const urls = [];

  for (const [, entries] of groups) {
    const alternates = entries.map((entry) => ({
      hreflang: routeLang(entry.route),
      href: absoluteRoute(entry.route),
    }));
    alternates.push({
      hreflang: "x-default",
      href: absoluteRoute(entries.find((e) => routeLang(e.route) === "tr")?.route || entries[0].route),
    });

    for (const entry of entries) {
      const loc = absoluteRoute(entry.route);
      const altLinks = alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`,
        )
        .join("\n");
      urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
${altLinks}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
}

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

# AI / answer engines are explicitly welcome (AEO/GEO)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

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
      await page.waitForSelector("section#home, .blogpost, .landing-page, .sv-page", { timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);

      const outPath = path.join(DIST, target.out);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, html, "utf-8");
      console.log(`✓ prerendered ${target.route} → dist/${target.out}`);
      await page.close();
    }

    const sitemap = buildSitemapXml(TARGETS);
    await writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf-8");
    await writeFile(path.join(DIST, "robots.txt"), ROBOTS_TXT, "utf-8");
    console.log("✓ generated dist/sitemap.xml");
    console.log("✓ generated dist/robots.txt");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
