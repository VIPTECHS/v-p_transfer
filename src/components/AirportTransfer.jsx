import { useI18n } from "../i18n/I18nContext";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";

export default function AirportTransfer() {
  const { t, dict } = useI18n();
  const features = dict.airportTransfer.features;

  return (
    <section className="section airport-transfer" id="airport-transfer">
      <div className="airport-transfer-grid">
        <div className="airport-transfer-visual">
          <img src="/images/services/Airport-Transfer.jpg" alt={t("airportTransfer.title")} loading="lazy" />
        </div>
        <div className="airport-transfer-copy">
          <SectionHeading
            eyebrow={t("airportTransfer.eyebrow")}
            title={t("airportTransfer.title")}
            text={t("airportTransfer.text")}
          />
          <ul className="airport-transfer-features">
            {features.map((feature) => (
              <li key={feature}>
                <Icon name="check" size={16} />
                {feature}
              </li>
            ))}
          </ul>
          <a className="btn btn-gold" href="#booking">{t("airportTransfer.cta")}</a>
        </div>
      </div>
    </section>
  );
}
