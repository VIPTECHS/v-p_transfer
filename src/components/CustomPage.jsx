import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { fetchPublicPage } from "../api/pages";
import {
  absoluteUrl,
  applyPageSeo,
  buildAlternates,
  injectBreadcrumbLd,
  removeJsonLd,
} from "../i18n/seo";

const LANGS = ["tr", "en", "de"];

function pickTranslation(translations, lang) {
  for (const l of [lang, ...LANGS]) {
    const t = translations?.[l];
    if (t && (t.title || t.bodyHtml)) return { lang: l, ...t };
  }
  return null;
}

export default function CustomPage({ slug, navigate }) {
  const { t, lang } = useI18n();
  const [state, setState] = useState({ status: "loading", page: null });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", page: null });
    fetchPublicPage(slug)
      .then((page) => active && setState({ status: "ready", page }))
      .catch(() => active && setState({ status: "notfound", page: null }));
    return () => {
      active = false;
    };
  }, [slug]);

  const page = state.page;
  const content = page ? pickTranslation(page.translations, lang) : null;

  useEffect(() => {
    if (!content) return undefined;
    const pathFor = (l) => (l === "tr" ? `/${slug}` : `/${l}/${slug}`);
    applyPageSeo({
      title: `${content.title} | VIP Transfer`,
      description: content.metaDescription || "",
      canonical: absoluteUrl(pathFor(content.lang)),
      alternates: buildAlternates(pathFor),
    });
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: content.title, url: absoluteUrl(pathFor(content.lang)) },
    ]);
    return () => removeJsonLd("ld-breadcrumb");
  }, [content, slug, lang]);

  if (state.status === "loading") {
    return (
      <div className="blogpost">
        <div className="blogpost-inner" style={{ minHeight: "40vh" }}>
          <p style={{ color: "#888" }}>…</p>
        </div>
      </div>
    );
  }

  if (state.status === "notfound" || !content) {
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

  return (
    <article className="blogpost sitepage custom-page">
      <header className="sitepage-hero">
        <div className="sitepage-hero-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {t("footer.back")}
          </button>
          <h1 className="blogpost-title">{content.title}</h1>
        </div>
      </header>

      <div className="blogpost-inner">
        <div
          className="custom-page__body"
          // Content is sanitized server-side (sanitize-html) before storage/serving.
          dangerouslySetInnerHTML={{ __html: content.bodyHtml || "" }}
        />
      </div>
    </article>
  );
}
