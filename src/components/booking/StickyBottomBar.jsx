import { useI18n } from "../../i18n/I18nContext";

export default function StickyBottomBar({ vehicleName, onContinue, disabled, isLastStep }) {
  const { t } = useI18n();

  return (
    <div className="bw-sticky-bar">
      <div className="bw-sticky-bar-inner">
        <span className="bw-sticky-choice">
          {vehicleName
            ? <><strong>{t("wizard.yourChoice")}:</strong> {vehicleName}</>
            : <span className="bw-sticky-choice--empty">{t("wizard.yourChoice")}:</span>
          }
        </span>
        <button
          type="button"
          className="bw-sticky-btn"
          onClick={onContinue}
          disabled={disabled}
        >
          {isLastStep ? t("wizard.bookNow") : t("wizard.continue")}
        </button>
      </div>
    </div>
  );
}
