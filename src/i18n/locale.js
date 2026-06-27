export const HTML_LOCALES = { en: "en-GB", tr: "tr-TR", de: "de-DE" };
export const OG_LOCALES = { en: "en_US", tr: "tr_TR", de: "de_DE" };
export const LANG_PREFIX_RE = /^\/(tr|en|de)(?=\/|$)/;

export function resolveIntlLocale(lang) {
  return HTML_LOCALES[lang] || HTML_LOCALES.en;
}

export function detectBrowserLang() {
  if (typeof navigator === "undefined") return "en";
  const code = (navigator.language || "en").toLowerCase();
  if (code.startsWith("tr")) return "tr";
  if (code.startsWith("de")) return "de";
  return "en";
}
