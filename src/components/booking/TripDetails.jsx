import { lazy, Suspense, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { defaultPickupDate, toPickupISO } from "../../utils/datetime";
import { BOOKING_TYPES, requiresDestination, requiresDuration } from "../../utils/bookingTypes";

const LocationMapPopover = lazy(() => import("../LocationMapPopover"));

function pointFrom(label, coords) {
  if (!label) return null;
  return { label, lng: coords?.lng, lat: coords?.lat };
}

export default function TripDetails({ state, dispatch, onContinue }) {
  const { t } = useI18n();
  const { tripData } = state;

  const [bookingType, setBookingType] = useState(tripData?.type || "transfer");
  const [pickupAt, setPickupAt] = useState(tripData?.pickupAt || toPickupISO(defaultPickupDate()));
  const [fromPoint, setFromPoint] = useState(pointFrom(tripData?.from, tripData?.fromCoords));
  const [toPoint, setToPoint] = useState(pointFrom(tripData?.to, tripData?.toCoords));
  const [durationHours, setDurationHours] = useState(String(tripData?.durationHours || "4"));
  const [activeField, setActiveField] = useState(null);
  const [activeQuery, setActiveQuery] = useState("");
  const [message, setMessage] = useState("");

  const minPickup = toPickupISO(new Date());
  const hasCoords = (p) => p && p.lng != null && p.lat != null;

  const handleContinue = (event) => {
    event.preventDefault();
    setMessage("");

    const from = (fromPoint?.label || "").trim();
    const to = (toPoint?.label || "").trim();
    const needsTo = requiresDestination(bookingType);
    const needsDuration = requiresDuration(bookingType);

    if (!pickupAt || !from) {
      setMessage(needsDuration ? t("booking.hourlyValidation") : t("booking.validation"));
      return;
    }
    if (needsTo && !to) {
      setMessage(t("booking.validation"));
      return;
    }
    if (needsDuration && (!durationHours || Number(durationHours) < 1)) {
      setMessage(t("booking.hourlyValidation"));
      return;
    }

    dispatch({
      type: "SET_TRIP",
      payload: {
        type: bookingType,
        pickupAt,
        from,
        to: needsTo ? to : undefined,
        durationHours: needsDuration ? Number(durationHours) : undefined,
        fromCoords: hasCoords(fromPoint) ? { lng: fromPoint.lng, lat: fromPoint.lat } : undefined,
        toCoords: hasCoords(toPoint) && needsTo ? { lng: toPoint.lng, lat: toPoint.lat } : undefined,
      },
    });
    onContinue();
  };

  const activePoint = activeField === "from" ? fromPoint : toPoint;
  const otherPoint = activeField === "from" ? toPoint : fromPoint;

  const handleConfirm = (point) => {
    if (activeField === "from") setFromPoint(point);
    else setToPoint(point);
  };

  return (
    <div className="bw-main bw-trip-edit">
      <h2 className="bw-page-title">{t("wizard.steps.search")}</h2>

      <div className="bw-trip-layout">
        <form className="bw-trip-form" onSubmit={handleContinue}>
          <div className="bw-trip-tabs" role="group" aria-label="Booking type">
            {BOOKING_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={bookingType === type ? "active" : ""}
                onClick={() => setBookingType(type)}
              >
                {t(`booking.types.${type}`)}
              </button>
            ))}
          </div>

          <label className="vehicle-book-field">
            <span>{t("booking.pickupLabel")}</span>
            <input
              type="datetime-local"
              value={pickupAt}
              min={minPickup}
              onChange={(e) => setPickupAt(e.target.value)}
            />
          </label>

          <div className="vehicle-book-field">
            <span>{t("booking.fromLabel")}</span>
            <button
              type="button"
              className={`bw-trip-trigger${activeField === "from" ? " is-active" : ""}${fromPoint ? " has-value" : ""}`}
              onClick={() => {
                const next = activeField === "from" ? null : "from";
                setActiveField(next);
                setActiveQuery(next ? fromPoint?.label || "" : "");
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3"><circle cx="12" cy="12" r="4" /></svg>
              <span>{fromPoint?.label || t("booking.fromPlaceholder")}</span>
            </button>
          </div>

          {requiresDestination(bookingType) ? (
            <div className="vehicle-book-field">
              <span>{t("booking.toLabel")}</span>
              <button
                type="button"
                className={`bw-trip-trigger${activeField === "to" ? " is-active" : ""}${toPoint ? " has-value" : ""}`}
                onClick={() => {
                  const next = activeField === "to" ? null : "to";
                  setActiveField(next);
                  setActiveQuery(next ? toPoint?.label || "" : "");
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="3"><circle cx="12" cy="12" r="4" /></svg>
                <span>{toPoint?.label || t("booking.toPlaceholder")}</span>
              </button>
            </div>
          ) : (
            <label className="vehicle-book-field">
              <span>{t("booking.durationLabel")}</span>
              <input
                type="number"
                min="1"
                max="24"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </label>
          )}

          <button className="bw-trip-submit" type="submit">
            {t("wizard.continue")}
          </button>

          {message && (
            <p className="booking-feedback booking-feedback--error" role="status">
              {message}
            </p>
          )}
        </form>

        <div className="bw-map-panel">
          {activeField && (
            <Suspense fallback={<div className="bw-map-loading">{t("map.loading")}</div>}>
              <LocationMapPopover
                open
                variant={activeField}
                value={activePoint}
                other={otherPoint}
                query={activeQuery}
                onQueryChange={setActiveQuery}
                onConfirm={handleConfirm}
                onClose={() => setActiveField(null)}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
