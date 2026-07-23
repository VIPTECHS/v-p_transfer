// Renders a DB-backed CustomPage into a full, crawler-friendly HTML document by
// reusing the built Vite shell (dist/index.html) so all hashed asset/script tags
// stay correct. Only the SEO head fields and the #root content are overridden.
// The client (CustomPage.jsx) re-renders the same content for JS visitors.

const SITE_URL = "https://viptransfer.com";
const LANGS = ["tr", "en", "de"];

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function langPath(lang, slug) {
  return lang === "tr" ? `/${slug}` : `/${lang}/${slug}`;
}

function absolute(pathname) {
  return `${SITE_URL}${pathname}`;
}

// Pick the best translation for a language, falling back to any populated one.
function pickTranslation(translations, lang) {
  const order = [lang, "tr", "en", "de"];
  for (const l of order) {
    const t = translations[l];
    if (t && (t.title || t.bodyHtml)) return { lang: l, ...t };
  }
  return { lang, title: "", metaDescription: "", bodyHtml: "" };
}

export function renderCustomPageHtml(shellHtml, page, lang) {
  const translations = page.translations || {};
  const t = pickTranslation(translations, lang);
  const slug = page.slug;
  const selfPath = langPath(lang, slug);
  const canonical = absolute(selfPath);

  const title = t.title ? `${t.title} | VIP Transfer` : "VIP Transfer";
  const description = (t.metaDescription || "").slice(0, 300);

  // hreflang: one per language that has content, plus x-default → tr (or first).
  const populated = LANGS.filter((l) => translations[l] && (translations[l].title || translations[l].bodyHtml));
  const hreflangLangs = populated.length ? populated : [lang];
  const alternates = hreflangLangs.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${absolute(langPath(l, slug))}"/>`,
  );
  const xDefaultLang = hreflangLangs.includes("tr") ? "tr" : hreflangLangs[0];
  alternates.push(
    `<link rel="alternate" hreflang="x-default" href="${absolute(langPath(xDefaultLang, slug))}"/>`,
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
