import { useEffect } from "react";
import Gallery from "./Gallery";
import { useI18n } from "../i18n/I18nContext";

export default function MediaPage({ navigate }) {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t("nav.media")} | VIP Transfer`;
  }, [t]);

  return (
    <article className="blogpost sitepage">
      <header className="sitepage-hero">
        <div className="sitepage-hero-inner">
          <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {t("footer.back")}
          </button>
          <span className="sitepage-eyebrow">{t("gallery.eyebrow")}</span>
          <h1 className="blogpost-title">{t("nav.media")}</h1>
          <p className="blogpost-lead">{t("gallery.text")}</p>
        </div>
      </header>
      <Gallery showHeading={false} />
    </article>
  );
}
