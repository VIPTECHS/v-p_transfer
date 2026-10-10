import { useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import { getLandingPagePath } from "../data/landingPages";
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

export default function LandingPage({ page, onSearch }) {
  const { lang, t } = useI18n();
  const title = page.heroTitle[lang] || page.heroTitle.en;
  const subtitle = page.heroSubtitle[lang] || page.heroSubtitle.en;
  const duration = typeof page.duration === "string" ? page.duration : page.duration?.[lang] || page.duration?.en;
  const highlights = Array.isArray(page.highlights) ? page.highlights : page.highlights?.[lang] || page.highlights?.en || [];

  useEffect(() => {
    applyLandingSeo(page.slug, lang);
    const pageUrl = absoluteUrl(getLandingPagePath(page, lang));
    injectServiceLd({ name: title, description: subtitle, url: pageUrl });
    injectBreadcrumbLd([
      { name: "Home", url: absoluteUrl(lang === "tr" ? "/" : `/${lang}/`) },
      { name: title, url: pageUrl },
    ]);
    return () => {
      removeJsonLd("ld-service");
      removeJsonLd("ld-breadcrumb");
    };
  }, [page, lang, title, subtitle]);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <p className="landing-eyebrow">VIP TRANSFER</p>
          <h1>{title}</h1>
          <p className="landing-subtitle">{subtitle}</p>
          {duration && (
            <p className="landing-duration">⏱ {duration}</p>
          )}
          <ul className="landing-highlights">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-booking" id="booking">
        <BookingForm visible onSearch={onSearch} />
      </section>

      <Fleet onSearch={onSearch} />
      <FAQ />
      <section className="landing-cta">
        <a href="#booking" className="btn btn-gold">{t("nav.bookNow")}</a>
      </section>
    </main>
  );
}
