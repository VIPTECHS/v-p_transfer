import { useEffect, useState } from "react";
import { getSitePage } from "../data/sitePages";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { fetchPublicPolicyContent } from "../api/pages";
import {
  absoluteUrl,
  applySitePageSeo,
  injectBreadcrumbLd,
  removeJsonLd,
} from "../i18n/seo";

const EDITABLE_POLICY_SLUGS = new Set([
  "cancellation-policy", "terms-conditions", "privacy-policy", "cookie-policy",
]);

function policySections(body, lang) {
  const sections = [];
  const fallbackHeading = { tr: "Detaylar", en: "Details", de: "Einzelheiten" }[lang] || "Details";
  let heading = "";
  let paragraphLines = [];

  const flushParagraph = () => {
    const paragraph = paragraphLines.join(" ").trim();
    if (paragraph) {
      if (!sections.length || sections[sections.length - 1].heading !== heading) {
        sections.push({ heading: heading || fallbackHeading, paragraphs: [] });
      }
      sections[sections.length - 1].paragraphs.push(paragraph);
    }
    paragraphLines = [];
  };

  for (const line of String(body || "").split(/\r?\n/)) {
    const value = line.trim();
    if (value.startsWith("## ")) {
      flushParagraph();
      heading = value.slice(3).trim();
      sections.push({ heading, paragraphs: [] });
    } else if (!value) {
      flushParagraph();
    } else {
      paragraphLines.push(value);
    }
  }
  flushParagraph();
  return sections.filter((section) => section.paragraphs.length > 0);
}

export default function SitePage({ slug, navigate }) {
  const { t, lang } = useI18n();
  const page = getSitePage(slug);
  const baseContent = page ? page.content[lang] || page.content.en : null;
  const [policyOverride, setPolicyOverride] = useState(null);

  useEffect(() => {
    setPolicyOverride(null);
    if (!EDITABLE_POLICY_SLUGS.has(slug)) return undefined;
    let active = true;
    fetchPublicPolicyContent(slug, lang)
      .then((content) => { if (active) setPolicyOverride(content); })
      .catch(() => {});
    return () => { active = false; };
  }, [slug, lang]);

  const c = policyOverride ? {
    title: policyOverride.title,
    intro: policyOverride.intro,
    sections: policySections(policyOverride.body, lang),
  } : baseContent;

  useEffect(() => {
    if (!page || !c) return undefined;
    applySitePageSeo(page.slug, lang);
    if (policyOverride) {
      document.title = `${policyOverride.title} | VIP Transfer`;
      document.querySelector('meta[name="description"]')?.setAttribute("content", policyOverride.intro);
    }
    const pageUrl = absoluteUrl(lang === "tr" ? `/${page.slug}` : `/${lang}/${page.slug}`);
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: t(`footer.columns.${page.column}.title`), url: pageUrl },
      { name: c.title, url: pageUrl },
    ]);
    return () => removeJsonLd("ld-breadcrumb");
  }, [page, c, lang, t, policyOverride]);

  if (!page || !c) {
    return (
      <div className="blogpost">
        <div className="blogpost-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            ← {t("footer.back")}
          </button>
          <h1 className="blogpost-title">404</h1>
        </div>
      </div>
    );
  }

  const columnLabel = t(`footer.columns.${page.column}.title`);
  const isPartnerPage = page.slug === "travel-partners";

  return (
    <article className="blogpost sitepage">
      <header className="sitepage-hero">
        <div className="sitepage-hero-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {t("footer.back")}
          </button>
          <span className="sitepage-eyebrow">{columnLabel}</span>
          <h1 className="blogpost-title">{c.title}</h1>
        </div>
      </header>

      <div className="blogpost-inner">
        <p className="blogpost-lead">{c.intro}</p>

        {c.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>
        ))}

        <div className="blogpost-cta">
          {isPartnerPage ? (
            <>
              <p>{c.sections.at(-1)?.paragraphs?.[0]}</p>
              <a
                className="btn btn-gold"
                href="/partner-application"
                onClick={(event) => { event.preventDefault(); navigate("/partner-application"); }}
              >
                {t("footer.partner.cta")}
              </a>
            </>
          ) : (
            <>
              <p>{t("blog.ctaText")}</p>
              <a className="btn btn-gold" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {t("blog.ctaButton")}
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
