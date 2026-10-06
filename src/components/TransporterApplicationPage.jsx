import { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
import TransporterApplicationForm from "./TransporterApplicationForm";
import WhatsAppCTA from "./WhatsAppCTA";
import { useI18n } from "../i18n/I18nContext";

const PAGE_COPY = {
  tr: { title: "Taşımacı Partner Başvurusu", lead: "VipTransfer.com – Taşımacı Partner Başvuru Formu", back: "Ana sayfaya dön" },
  en: { title: "Transport Provider Partner Application", lead: "VipTransfer.com – Transport Provider Partner Application", back: "Back to home" },
  de: { title: "Bewerbung als Transportpartner", lead: "VipTransfer.com – Bewerbung als Transportpartner", back: "Zur Startseite" },
};

export default function TransporterApplicationPage({ navigate, onBook }) {
  const { lang, t } = useI18n();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;

  useEffect(() => { document.title = `${copy.title} | VIP Transfer`; }, [copy.title]);

  return (
    <div id="top">
      <Header isHome={false} navigate={navigate} onBook={onBook} />
      <article className="blogpost sitepage partner-application-page">
        <header className="sitepage-hero">
          <div className="sitepage-hero-inner">
            <button type="button" className="blogpost-back" onClick={() => navigate("/")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              {copy.back}
            </button>
            <span className="sitepage-eyebrow">{t("footer.partner.title")}</span>
            <h1 className="blogpost-title">{copy.title}</h1>
          </div>
        </header>
        <div className="blogpost-inner">
          <p className="blogpost-lead">{copy.lead}</p>
          <section className="partner-application-section" aria-labelledby="transporter-application-title">
            <h2 id="transporter-application-title">{copy.title}</h2>
            <TransporterApplicationForm />
          </section>
        </div>
      </article>
      <Footer navigate={navigate} />
      <WhatsAppCTA />
    </div>
  );
}
