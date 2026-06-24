import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getNested, interpolate, translations } from "./translations";

const I18nContext = createContext(null);
const STORAGE_KEY = "viptransfer-lang";

function getLangFromPath() {
  if (typeof window === "undefined") return null;
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return seg && translations[seg] ? seg : null;
}

function getInitialLang() {
  const fromPath = getLangFromPath();
  if (fromPath) return fromPath;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && translations[saved]) return saved;
  const browser = navigator.language?.startsWith("tr") ? "tr" : "en";
  return translations[browser] ? browser : "en";
}

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function applyHead(lang, dict) {
  const seo = dict.seo || {};
  if (seo.title) document.title = seo.title;
  setMeta('meta[name="description"]', "content", seo.description || "");
  setMeta('meta[property="og:title"]', "content", seo.ogTitle || seo.title || "");
  setMeta('meta[property="og:description"]', "content", seo.description || "");
  setMeta('meta[name="twitter:title"]', "content", seo.ogTitle || seo.title || "");
  setMeta('meta[name="twitter:description"]', "content", seo.description || "");
  setMeta('meta[property="og:locale"]', "content", lang === "tr" ? "tr_TR" : "en_US");
  document.documentElement.lang = lang;

  // FAQPage structured data from translations
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
    localStorage.setItem(STORAGE_KEY, next);
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
