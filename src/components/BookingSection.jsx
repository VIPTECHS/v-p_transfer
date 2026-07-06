import { useI18n } from "../i18n/I18nContext";
import BookingForm from "./BookingForm";

// Dedicated reservation band that sits directly below the scroll-animated hero.
// The booking panel used to float over the hero image; it now has its own
// prominent section with a supporting headline.
export default function BookingSection({ onSearch }) {
  const { t } = useI18n();

  return (
    <section className="booking-band" id="booking-section" aria-label={t("booking.bandTitle")}>
      <div className="booking-band-glow" aria-hidden="true" />
      <div className="booking-band-inner">
        <div className="booking-band-intro">
          <span className="booking-band-eyebrow">{t("booking.bandEyebrow")}</span>
          <h2 className="booking-band-title">{t("booking.bandTitle")}</h2>
          <p className="booking-band-text">{t("booking.bandText")}</p>
        </div>

        <div className="booking-band-card">
          <BookingForm visible onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
