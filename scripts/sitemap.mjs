import { blogPosts } from "../src/data/blogPosts.js";
import { getLandingPagePath, getLandingPageSlug, landingPages } from "../src/data/landingPages.js";
import { sitePages } from "../src/data/sitePages.js";

const SITE_URL = "https://viptransfer.com";

// Keep every statically rendered public route in one list. /tr/ remains a
// prerender target, but is omitted from the sitemap because / is its canonical.
export const PRERENDER_TARGETS = [
  { route: "/", lang: "tr", out: "index.html" },
  { route: "/tr/", lang: "tr", out: "tr/index.html" },
  { route: "/en/", lang: "en", out: "en/index.html" },
  { route: "/de/", lang: "de", out: "de/index.html" },
  { route: "/deneyim", lang: "tr", out: "deneyim/index.html" },
  { route: "/en/deneyim", lang: "en", out: "en/deneyim/index.html" },
  { route: "/de/deneyim", lang: "de", out: "de/deneyim/index.html" },
  ...blogPosts.flatMap((post) => [
    { route: `/blog/${post.slug}`, lang: "tr", out: `blog/${post.slug}/index.html` },
    { route: `/en/blog/${post.slug}`, lang: "en", out: `en/blog/${post.slug}/index.html` },
    { route: `/de/blog/${post.slug}`, lang: "de", out: `de/blog/${post.slug}/index.html` },
  ]),
  ...landingPages.flatMap((page) => ["tr", "en", "de"].map((lang) => {
    const slug = getLandingPageSlug(page, lang);
    return {
      route: getLandingPagePath(page, lang),
      lang,
      out: `${lang === "tr" ? "" : `${lang}/`}${slug}/index.html`,
      alternateGroup: `landing:${page.slug}`,
    };
  })),
  ...sitePages.flatMap((page) => [
    { route: `/${page.slug}`, lang: "tr", out: `${page.slug}/index.html` },
    { route: `/en/${page.slug}`, lang: "en", out: `en/${page.slug}/index.html` },
    { route: `/de/${page.slug}`, lang: "de", out: `de/${page.slug}/index.html` },
  ]),
];

function routeLang(route) {
  const match = route.match(/^\/(en|de)(\/|$)/);
  return match ? match[1] : "tr";
}

function contentKey(target) {
  if (target.alternateGroup) return target.alternateGroup;
  const { route } = target;
  const normalized = route.endsWith("/") && route !== "/" ? route.slice(0, -1) : route;
  const languageRoute = normalized.match(/^\/(?:tr|en|de)(?=\/|$)/);
  const withoutLang = languageRoute ? normalized.slice(languageRoute[0].length) : normalized;
  return withoutLang || "/";
}

function absoluteRoute(route) {
  if (route === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${route.startsWith("/") ? route : `/${route}`}`;
}

export function buildSitemapXml(targets = PRERENDER_TARGETS) {
  const lastmod = new Date().toISOString().split("T")[0];
  const groups = new Map();
  const sitemapTargets = targets.filter((target) => target.route !== "/tr/");

  for (const target of sitemapTargets) {
    const key = contentKey(target);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(target);
  }

  const urls = [];

  for (const entries of groups.values()) {
    const alternates = entries.map((entry) => ({
      hreflang: routeLang(entry.route),
      href: absoluteRoute(entry.route),
    }));
    alternates.push({
      hreflang: "x-default",
      href: absoluteRoute(entries.find((entry) => entry.lang === "en")?.route || entries[0].route),
    });

    for (const entry of entries) {
      const altLinks = alternates
        .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`)
        .join("\n");
      urls.push(`  <url>
    <loc>${absoluteRoute(entry.route)}</loc>
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
