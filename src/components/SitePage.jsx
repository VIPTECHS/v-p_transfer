import { useEffect } from "react";
import { getSitePage } from "../data/sitePages";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import {
  absoluteUrl,
  applySitePageSeo,
  injectBreadcrumbLd,
  removeJsonLd,
} from "../i18n/seo";

export default function SitePage({ slug, navigate }) {
  const { t, lang } = useI18n();
  const page = getSitePage(slug);
  const c = page ? page.content[lang] || page.content.en : null;

  useEffect(() => {
    if (!page || !c) return undefined;
    applySitePageSeo(page.slug, lang);
    const pageUrl = absoluteUrl(lang === "tr" ? `/${page.slug}` : `/${lang}/${page.slug}`);
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: t(`footer.columns.${page.column}.title`), url: pageUrl },
      { name: c.title, url: pageUrl },
    ]);
    return () => removeJsonLd("ld-breadcrumb");
  }, [page, c, lang, t]);

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
          <p>{t("blog.ctaText")}</p>
          <a className="btn btn-gold" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            {t("blog.ctaButton")}
          </a>
        </div>
      </div>
    </article>
  );
}
