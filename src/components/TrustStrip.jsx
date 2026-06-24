import { useI18n } from "../i18n/I18nContext";

export default function TrustStrip() {
  const { t } = useI18n();

  return (
    <section className="trust-strip" aria-label={t("trustStrip.ariaLabel")}>
      <div className="trust-strip-copy">
        <strong>{t("trustStrip.title")}</strong>
        <p>{t("trustStrip.text")}</p>
      </div>
      <div className="trust-strip-brands">
        <img className="partner-logo partner-logo-tripadvisor" src="/images/partners/tripadvisor.png" alt="Tripadvisor" />
        <img className="partner-logo partner-logo-google" src="/images/partners/google-reviews.png" alt="Google Reviews 5.0" />
        <img className="partner-logo partner-logo-kitsab" src="/images/partners/kitsab.png" alt="KITSAB" />
      </div>
    </section>
  );
}
