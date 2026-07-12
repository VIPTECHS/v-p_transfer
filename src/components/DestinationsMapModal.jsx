import { lazy, Suspense, useEffect } from "react";
import { DESTINATION_CITIES } from "../data/destinationCities";
import { useI18n } from "../i18n/I18nContext";

const DestinationsInteractiveMap = lazy(() => import("./DestinationsInteractiveMap"));

export default function DestinationsMapModal({ open, onClose, litId, onCityEnter, onCityLeave }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="destinations-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="destinations-modal-title" onClick={onClose}>
      <div className="destinations-modal" onClick={(event) => event.stopPropagation()}>
        <header className="destinations-modal-header">
          <div>
            <p className="destinations-modal-eyebrow">{t("airportTransfer.modal.eyebrow")}</p>
            <h2 id="destinations-modal-title" className="destinations-modal-title">{t("airportTransfer.modal.title")}</h2>
            <p className="destinations-modal-text">{t("airportTransfer.modal.text")}</p>
          </div>
          <button type="button" className="destinations-modal-close" onClick={onClose} aria-label={t("airportTransfer.modal.close")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="destinations-modal-body">
          <Suspense fallback={<div className="destinations-map-loading">{t("map.loading")}</div>}>
            <DestinationsInteractiveMap
              cities={DESTINATION_CITIES}
              litId={litId}
              onCityEnter={onCityEnter}
              onCityLeave={onCityLeave}
            />
          </Suspense>
        </div>

        <footer className="destinations-modal-footer">
          <span>{t("airportTransfer.modal.count", { count: DESTINATION_CITIES.length })}</span>
        </footer>
      </div>
    </div>
  );
}
