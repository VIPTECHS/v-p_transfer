import { processSteps } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import SectionHeading from "./SectionHeading";

export default function Process() {
  const { t } = useI18n();

  return (
    <section className="section process">
      <SectionHeading center eyebrow={t("process.eyebrow")} title={t("process.title")} />
      <div className="steps">
        {processSteps.map((key, index) => (
          <div className="step" key={key}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div className="step-dot" />
            <h3>{t(`process.steps.${key}.title`)}</h3>
            <p>{t(`process.steps.${key}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
