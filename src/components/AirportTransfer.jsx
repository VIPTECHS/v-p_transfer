import { useEffect, useRef, useState } from "react";
import { FEATURED_CITIES } from "../data/destinationCities";
import { useI18n } from "../i18n/I18nContext";
import DestinationsMapModal from "./DestinationsMapModal";
import WorldDestinationsMap from "./WorldDestinationsMap";

const ROTATE_MS = 3400;

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function AirportTransfer() {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState(FEATURED_CITIES[0].id);
  const [hoveredId, setHoveredId] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const leaveTimer = useRef(null);
  const litId = hoveredId ?? activeId;

  useEffect(() => {
    if (hoveredId || mapOpen) return undefined;
    const timer = window.setInterval(() => {
      setActiveId((prev) => {
        const index = FEATURED_CITIES.findIndex((city) => city.id === prev);
        return FEATURED_CITIES[(index + 1) % FEATURED_CITIES.length].id;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [hoveredId, mapOpen]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const lightCity = (id) => {
    window.clearTimeout(leaveTimer.current);
    setHoveredId(id);
    setActiveId(id);
  };

  const dimCity = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHoveredId(null), 120);
  };

  const openMap = () => {
    setMapOpen(true);
    setActiveId(litId);
  };

  return (
    <>
      <section className="section airport-transfer global-reach" id="airport-transfer">
        <div className="global-reach-grid">
          <div className="global-reach-copy">
            <p className="global-reach-eyebrow">
              <PinIcon />
              <span>{t("airportTransfer.eyebrow")}</span>
            </p>
            <h2 className="global-reach-title">
              {t("airportTransfer.titleBefore")}{" "}
              <span className="global-reach-title-accent">{t("airportTransfer.titleAccent")}</span>
            </h2>
            <p className="global-reach-text">{t("airportTransfer.text")}</p>
            <button type="button" className="global-reach-cta" onClick={openMap}>
              {t("airportTransfer.cta")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="global-reach-visual" aria-label={t("airportTransfer.mapAria")}>
            <WorldDestinationsMap
              cities={FEATURED_CITIES}
              litId={litId}
              variant="featured"
              onCityEnter={lightCity}
              onCityLeave={dimCity}
              ariaLabel={t("airportTransfer.mapAria")}
            />
          </div>
        </div>
      </section>

      <DestinationsMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        litId={litId}
        onCityEnter={lightCity}
        onCityLeave={dimCity}
      />
    </>
  );
}
