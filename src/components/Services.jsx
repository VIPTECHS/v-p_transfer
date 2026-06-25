import { serviceItems } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";

export default function Services() {
  const { t } = useI18n();

  return (
    <section className="section services" id="services">
      <SectionHeading
        eyebrow={t("services.eyebrow")}
        title={t("services.title")}
        text={t("services.text")}
      />
      <div className="service-grid">
        {serviceItems.map(({ key, icon, image }, index) => (
          <article className={`service-card service-${index + 1}`} key={key}>
            <div className="service-visual">
              <img src={image} alt={t(`services.items.${key}.title`)} loading="lazy" />
            </div>
            <div className="service-copy">
              <div className="service-icon"><Icon name={icon} /></div>
              <h3>{t(`services.items.${key}.title`)}</h3>
              <p>{t(`services.items.${key}.text`)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
