import { useEffect } from "react";
import FAQ from "./FAQ";
import { useI18n } from "../i18n/I18nContext";

export default function FAQPage({ navigate }) {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t("nav.help")} | VIP Transfer`;
  }, [t]);

  return (
    <article className="blogpost sitepage">
      <header className="sitepage-hero">
        <div className="sitepage-hero-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {t("footer.back")}
          </button>
          <span className="sitepage-eyebrow">{t("faq.eyebrow")}</span>
          <h1 className="blogpost-title">{t("nav.help")}</h1>
          <p className="blogpost-lead">{t("faq.title")}</p>
        </div>
      </header>
      <FAQ showHeading={false} />
    </article>
  );
}
