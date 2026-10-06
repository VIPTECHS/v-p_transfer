// Per-language URL slugs for DB-backed custom pages.
//
// The CustomPage.slug column is the Turkish (default-language) slug and the
// page's stable identity. English/German may carry their own slug in
// translations[lang].slug; when empty they reuse the base slug.

export const LANGS = ["tr", "en", "de"];

export function parseTranslations(page) {
  try {
    return JSON.parse(page.translations || "{}") || {};
  } catch {
    return {};
  }
}

export function hasContent(t) {
  return Boolean(t && (t.title || t.bodyHtml));
}

export function effectiveSlug(page, translations, lang) {
  if (lang === "tr") return page.slug;
  return translations?.[lang]?.slug || page.slug;
}

// { tr: "slug", en: "slug-en" } for every language that actually has content.
export function populatedSlugs(page, translations = parseTranslations(page)) {
  const out = {};
  for (const l of LANGS) {
    if (hasContent(translations[l])) out[l] = effectiveSlug(page, translations, l);
  }
  return out;
}

export function langPath(lang, slug) {
  return lang === "tr" ? `/${slug}` : `/${lang}/${slug}`;
}

// Resolve the page whose `lang` version lives at `slug`.
// Returns { page, translations, redirectTo } — redirectTo is set when `slug` is
// only the legacy shared slug of a language that now has its own slug.
export function resolveByLangSlug(pages, lang, slug) {
  let legacy = null;
  for (const page of pages) {
    const translations = parseTranslations(page);
    if (!hasContent(translations[lang])) continue;
    const own = effectiveSlug(page, translations, lang);
    if (own === slug) return { page, translations, redirectTo: null };
    if (page.slug === slug && !legacy) legacy = { page, translations, redirectTo: langPath(lang, own) };
  }
  return legacy;
}
