import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getNested, interpolate, translations } from "./translations";
import { OG_LOCALES } from "./locale";
import { upsertJsonLd } from "./seo";

const I18nContext = createContext(null);

function getLangFromPath() {
  if (typeof window === "undefined") return null;
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return seg && translations[seg] ? seg : null;
}

function getInitialLang() {
  const fromPath = getLangFromPath();
  if (fromPath) return fromPath;
  // Unprefixed routes are the Turkish canonical URLs. Locale selection is
  // represented by /en/ and /de/ paths, so browser or saved locale must not
  // change the content served at a Turkish canonical URL.
  return "tr";
}

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function applyHead(lang, dict) {
  setMeta('meta[property="og:locale"]', "content", OG_LOCALES[lang] || OG_LOCALES.en);
  document.documentElement.lang = lang;

  const faqItems = dict.faq?.items;
  if (faqItems) {
    upsertJsonLd("ld-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: Object.values(faqItems).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = (next) => {
    if (!translations[next]) return;
    setLangState(next);
  };

  useEffect(() => {
    applyHead(lang, translations[lang]);
  }, [lang]);

  const value = useMemo(() => {
    const dict = translations[lang];

    const t = (key, vars) => {
      const raw = getNested(dict, key);
      if (typeof raw !== "string") return key;
      return interpolate(raw, vars);
    };

    return { lang, setLang, t, dict };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
