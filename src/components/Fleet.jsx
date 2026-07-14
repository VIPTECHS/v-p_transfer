import { useMemo, useState } from "react";
import { fleetItems, fleetPreviewKeys } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import Icon from "./Icon";
import LocationAutocomplete from "./LocationAutocomplete";
import { defaultPickupDate, toPickupISO } from "../utils/datetime";

function VehicleCard({ item, onSearch }) {
  const { t } = useI18n();
  const { key, image, hoverImage, popular } = item;

  const [flipped, setFlipped] = useState(false);
  const [pickupAt, setPickupAt] = useState(() => toPickupISO(defaultPickupDate()));
  const [fromPoint, setFromPoint] = useState(null);
  const [toPoint, setToPoint] = useState(null);
  const [message, setMessage] = useState("");

  const name = t(`fleet.items.${key}.name`);
  const minPickup = toPickupISO(new Date());

  const handleBook = (event) => {
    event.preventDefault();
    setMessage("");

    const from = (fromPoint?.label || "").trim();
    const to = (toPoint?.label || "").trim();

    if (!pickupAt || !from || !to) {
      setMessage(t("booking.validation"));
      return;
    }

    onSearch?.({
      type: "transfer",
      pickupAt,
      from,
      to,
      fromCoords: fromPoint?.lng != null ? { lng: fromPoint.lng, lat: fromPoint.lat } : undefined,
      toCoords: toPoint?.lng != null ? { lng: toPoint.lng, lat: toPoint.lat } : undefined,
      vehicle: key,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <article
      className={`vehicle-card ${popular ? "vehicle-card--popular" : ""}${hoverImage ? " vehicle-card--has-flip" : ""}${flipped ? " vehicle-card--booking" : ""}`}
    >
      <div className={`vehicle-card-flip${flipped ? " is-flipped" : ""}`}>
        <div
          className="vehicle-card-face vehicle-card-front"
          role="button"
          tabIndex={0}
          aria-label={`${name} — ${t("fleet.select")}`}
          onClick={() => setFlipped(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped(true);
            }
          }}
        >
          <div className={`vehicle-visual${hoverImage ? " vehicle-visual--flip" : ""}`}>
            {popular && <span className="vehicle-popular-badge">{t("booking.mostPopular")}</span>}
            {hoverImage ? (
              <div className="vehicle-flip-inner">
                <div className="vehicle-flip-face vehicle-flip-front">
                  <img src={image} alt={name} loading="lazy" />
                </div>
                <div className="vehicle-flip-face vehicle-flip-back">
                  <img src={hoverImage} alt={`${name} interior`} loading="lazy" />
                </div>
              </div>
            ) : (
              <img src={image} alt={name} loading="lazy" />
            )}
          </div>
          <div className="vehicle-info">
            <h3>{name}</h3>
            <div className="vehicle-specs">
              <span><Icon name="users" size={16} />{t(`fleet.items.${key}.passengers`)}</span>
              <span><Icon name="bag" size={16} />{t(`fleet.items.${key}.bags`)}</span>
            </div>
          </div>
        </div>

        <div className="vehicle-card-face vehicle-card-back">
          <div className="vehicle-back-head">
            <button
              type="button"
              className="vehicle-back-btn"
              onClick={() => setFlipped(false)}
              aria-label={t("calendar.prevMonth")}
            >
              <Icon name="arrow" size={15} />
            </button>
            <h3>{name}</h3>
          </div>

          <form className="vehicle-book-form" onSubmit={handleBook}>
            <label className="vehicle-book-field">
              <span>{t("booking.pickupLabel")}</span>
              <input
                type="datetime-local"
                value={pickupAt}
                min={minPickup}
                onChange={(e) => setPickupAt(e.target.value)}
              />
            </label>

            <LocationAutocomplete
              label={t("booking.fromLabel")}
              placeholder={t("booking.fromPlaceholder")}
              point={fromPoint}
              onChange={setFromPoint}
            />

            <LocationAutocomplete
              label={t("booking.toLabel")}
              placeholder={t("booking.toPlaceholder")}
              point={toPoint}
              onChange={setToPoint}
            />

            <button className="vehicle-book-submit" type="submit">
              {t("booking.search")}
            </button>

            {message && (
              <p className="booking-feedback booking-feedback--error" role="status">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </article>
  );
}

export default function Fleet({ onSearch }) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);

  const previewItems = useMemo(() => {
    const byKey = new Map(fleetItems.map((item) => [item.key, item]));
    return fleetPreviewKeys.map((key) => byKey.get(key)).filter(Boolean);
  }, []);

  const visibleItems = useMemo(() => {
    if (!showAll) return previewItems;
    const previewSet = new Set(fleetPreviewKeys);
    const rest = fleetItems.filter((item) => !previewSet.has(item.key));
    return [...previewItems, ...rest];
  }, [previewItems, showAll]);

  const canToggle = fleetItems.length > previewItems.length;

  const toggleShowAll = () => {
    setShowAll((prev) => {
      const next = !prev;
      if (!next) {
        requestAnimationFrame(() => {
          document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return next;
    });
  };

  return (
    <section className="section fleet" id="fleet">
      <div className="fleet-head">
        <div className="fleet-head-copy">
          <p className="fleet-eyebrow">
            <Icon name="taxi" size={16} />
            <span>{t("fleet.eyebrow")}</span>
          </p>
          <h2 className="fleet-title">
            {t("fleet.titleBefore")}
            <span className="fleet-title-accent">{t("fleet.titleAccent")}</span>
          </h2>
        </div>
        {canToggle && (
          <button
            type="button"
            className="fleet-viewall"
            aria-expanded={showAll}
            onClick={toggleShowAll}
          >
            {showAll ? t("fleet.showLess") : t("fleet.viewAll")}
            <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
      <div className={`fleet-grid${showAll ? " fleet-grid--all" : " fleet-grid--preview"}`}>
        {visibleItems.map((item) => (
          <VehicleCard key={item.key} item={item} onSearch={onSearch} />
        ))}
      </div>
    </section>
  );
}
