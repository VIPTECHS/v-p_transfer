// Renders a DB-backed CustomPage into a full, crawler-friendly HTML document by
// reusing the built Vite shell (dist/index.html) so all hashed asset/script tags
// stay correct. Only the SEO head fields and the #root content are overridden.
// The client (CustomPage.jsx) re-renders the same content for JS visitors.

import { populatedSlugs, langPath } from "./pageSlugs.js";

const SITE_URL = "https://viptransfer.com";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolute(pathname) {
  return `${SITE_URL}${pathname}`;
}

export function renderCustomPageHtml(shellHtml, page, lang) {
  const translations = page.translations || {};
  // Strict: the caller only renders languages that have their own content.
  const t = { lang, ...(translations[lang] || {}) };
  const slugs = populatedSlugs(page, translations);
  const selfPath = langPath(lang, slugs[lang] || page.slug);
  const canonical = absolute(selfPath);

  const title = t.title ? `${t.title} | VIP Transfer` : "VIP Transfer";
  const description = (t.metaDescription || "").slice(0, 300);

  // hreflang: one per language that has content, plus x-default → tr (or first).
  const hreflangLangs = Object.keys(slugs);
  const alternates = hreflangLangs.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${absolute(langPath(l, slugs[l]))}"/>`,
  );
  const xDefaultLang = hreflangLangs.includes("tr") ? "tr" : hreflangLangs[0];
  alternates.push(
    `<link rel="alternate" hreflang="x-default" href="${absolute(langPath(xDefaultLang, slugs[xDefaultLang]))}"/>`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": page.jsonLdType || "WebPage",
    name: t.title || "VIP Transfer",
    description,
    url: canonical,
    inLanguage: t.lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#business` },
  };
  if (page.ogImage) jsonLd.image = page.ogImage;

  const headInjection = [
    ...alternates,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join("\n    ");

  const bodyContent =
    `<main class="sv-page custom-page">` +
    `<div class="sv-page__inner">` +
    (t.title ? `<h1 class="sv-page__title">${escapeHtml(t.title)}</h1>` : "") +
    `<div class="custom-page__body">${t.bodyHtml || ""}</div>` +
    `</div></main>`;

  let html = shellHtml;

  // <html lang="..">
  html = html.replace(/<html([^>]*?)\slang="[^"]*"/i, `<html$1 lang="${t.lang}"`);
  if (!/<html[^>]*\slang=/i.test(html)) {
    html = html.replace(/<html/i, `<html lang="${t.lang}"`);
  }

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // meta description / og / twitter description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/i,
    `$1${escapeHtml(description)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
    `$1${escapeHtml(description)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
    `$1${escapeHtml(title)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/i,
    `$1${canonical}$2`,
  );

  // canonical (id="seo-canonical")
  html = html.replace(
    /(<link\s+id="seo-canonical"[^>]*href=")[^"]*(")/i,
    `$1${canonical}$2`,
  );

  // Remove the shell's static hreflang set (they point at the homepage) and
  // inject the page-specific set + JSON-LD before </head>.
  html = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, "");
  html = html.replace(/<\/head>/i, `    ${headInjection}\n  </head>`);

  // Inject content into the empty root so crawlers see it.
  html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${bodyContent}</div>`);

  return html;
}
