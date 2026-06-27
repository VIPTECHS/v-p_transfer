import { useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  absoluteUrl,
  applyLandingSeo,
  injectBreadcrumbLd,
  injectServiceLd,
  removeJsonLd,
} from "../i18n/seo";
import BookingForm from "./BookingForm";
import Fleet from "./Fleet";
import FAQ from "./FAQ";
import TrustStrip from "./TrustStrip";

export default function LandingPage({ page, onSearch }) {
  const { lang, t } = useI18n();
  const title = page.heroTitle[lang] || page.heroTitle.en;
  const subtitle = page.heroSubtitle[lang] || page.heroSubtitle.en;

  useEffect(() => {
    applyLandingSeo(page.slug, lang);
    const pageUrl = absoluteUrl(lang === "tr" ? `/${page.slug}` : `/${lang}/${page.slug}`);
    injectServiceLd({ name: title, description: subtitle, url: pageUrl });
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: title, url: pageUrl },
    ]);
    return () => {
      removeJsonLd("ld-service");
      removeJsonLd("ld-breadcrumb");
    };
  }, [page.slug, lang, title, subtitle]);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <p className="landing-eyebrow">VIP TRANSFER</p>
          <h1>{title}</h1>
          <p className="landing-subtitle">{subtitle}</p>
          {page.duration && (
            <p className="landing-duration">⏱ {page.duration}</p>
          )}
          <ul className="landing-highlights">
            {page.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-booking" id="booking">
        <BookingForm visible onSearch={onSearch} />
      </section>

      <TrustStrip />
      <Fleet onSearch={onSearch} />
      <FAQ />
      <section className="landing-cta">
        <a href="#booking" className="btn btn-gold">{t("nav.bookNow")}</a>
      </section>
    </main>
  );
}
