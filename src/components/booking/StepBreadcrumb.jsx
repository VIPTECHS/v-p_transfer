import { useI18n } from "../../i18n/I18nContext";

const STEPS = ["search", "serviceSelection", "pickupInfo", "checkout"];

export default function StepBreadcrumb({ current, onGoTo }) {
  const { t } = useI18n();

  return (
    <nav className="bw-breadcrumb" aria-label="Booking steps">
      {STEPS.map((key, i) => {
        const stepNum = i + 1;
        const completed = stepNum < current;
        const active = stepNum === current;
        return (
          <span key={key} className="bw-breadcrumb-item">
            {i > 0 && <span className="bw-breadcrumb-sep" aria-hidden="true">›</span>}
            <button
              type="button"
              className={`bw-breadcrumb-btn ${active ? "bw-breadcrumb-btn--active" : ""} ${completed ? "bw-breadcrumb-btn--done" : ""}`}
              onClick={() => completed && onGoTo(stepNum)}
              disabled={!completed}
              aria-current={active ? "step" : undefined}
            >
              {t(`wizard.steps.${key}`)}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
