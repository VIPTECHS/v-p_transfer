import { useI18n } from "../i18n/I18nContext";
import SectionHeading from "./SectionHeading";

export default function About() {
  const { t, dict } = useI18n();

  return (
    <section className="trust about" id="corporate">
      <div className="trust-image">
        <div className="experience">
          <strong>26+</strong>
          <span>{t("about.yearsLine1")}<br />{t("about.yearsLine2")}</span>
        </div>
      </div>
      <div className="trust-content">
        <SectionHeading
          eyebrow={t("about.eyebrow")}
          title={t("about.title")}
          text={t("about.text")}
        />
        <div className="about-story">
          {dict.about.story.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
        <p className="about-note">
          {t("about.note")} <strong>{t("about.tursab")}</strong>
        </p>
      </div>
    </section>
  );
}
