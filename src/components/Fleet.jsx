import { fleetItems } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";

export default function Fleet() {
  const { t } = useI18n();

  return (
    <section className="section fleet" id="fleet">
      <SectionHeading
        center
        eyebrow={t("fleet.eyebrow")}
        title={t("fleet.title")}
        text={t("fleet.text")}
      />
      <p className="fleet-intro">{t("fleet.intro")}</p>
      <div className="fleet-grid">
        {fleetItems.map(({ key, image, popular }) => (
          <article className={`vehicle-card ${popular ? "vehicle-card--popular" : ""}`} key={key}>
            <div className="vehicle-visual">
              {popular && <span className="vehicle-popular-badge">{t("booking.mostPopular")}</span>}
              <img src={image} alt={t(`fleet.items.${key}.name`)} loading="lazy" />
            </div>
            <div className="vehicle-info">
              <div>
                <small>{t("fleet.premium")}</small>
                <h3>{t(`fleet.items.${key}.name`)}</h3>
              </div>
              <div className="vehicle-specs">
                <span><Icon name="users" size={17} />{t(`fleet.items.${key}.passengers`)}</span>
                <span><Icon name="bag" size={17} />{t(`fleet.items.${key}.bags`)}</span>
              </div>
              <a className="vehicle-select" href="#booking">
                {t("fleet.select")} <Icon name="arrow" size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
