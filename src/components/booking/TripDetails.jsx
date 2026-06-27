import { lazy, Suspense, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { defaultPickupDate, toPickupISO } from "../../utils/datetime";

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
  const [message, setMessage] = useState("");

  const minPickup = toPickupISO(new Date());
  const hasCoords = (p) => p && p.lng != null && p.lat != null;

  const handleContinue = (event) => {
    event.preventDefault();
    setMessage("");

    const from = (fromPoint?.label || "").trim();
    const to = (toPoint?.label || "").trim();

    if (!pickupAt || !from) {
      setMessage(bookingType === "hourly" ? t("booking.hourlyValidation") : t("booking.validation"));
      return;
    }
    if (bookingType === "transfer" && !to) {
      setMessage(t("booking.validation"));
      return;
    }
    if (bookingType === "hourly" && (!durationHours || Number(durationHours) < 1)) {
      setMessage(t("booking.hourlyValidation"));
      return;
    }

    dispatch({
      type: "SET_TRIP",
      payload: {
        type: bookingType,
        pickupAt,
        from,
        to: bookingType === "hourly" ? undefined : to,
        durationHours: bookingType === "hourly" ? Number(durationHours) : undefined,
        fromCoords: hasCoords(fromPoint) ? { lng: fromPoint.lng, lat: fromPoint.lat } : undefined,
        toCoords: hasCoords(toPoint) ? { lng: toPoint.lng, lat: toPoint.lat } : undefined,
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
            <button
              type="button"
              className={bookingType === "transfer" ? "active" : ""}
              onClick={() => setBookingType("transfer")}
            >
              {t("booking.transfer")}
            </button>
            <button
              type="button"
              className={bookingType === "hourly" ? "active" : ""}
              onClick={() => setBookingType("hourly")}
            >
              {t("booking.hourly")}
            </button>
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
              onClick={() => setActiveField(activeField === "from" ? null : "from")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3"><circle cx="12" cy="12" r="4" /></svg>
              <span>{fromPoint?.label || t("booking.fromPlaceholder")}</span>
            </button>
          </div>

          {bookingType === "transfer" ? (
            <div className="vehicle-book-field">
              <span>{t("booking.toLabel")}</span>
              <button
                type="button"
                className={`bw-trip-trigger${activeField === "to" ? " is-active" : ""}${toPoint ? " has-value" : ""}`}
                onClick={() => setActiveField(activeField === "to" ? null : "to")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="3"><circle cx="12" cy="12" r="4" /></svg>
                <span>{toPoint?.label || t("booking.toPlaceholder")}</span>
              </button>
            </div>
          ) : (
            <label className="vehicle-book-field">
              <span>{t("booking.hourly")}</span>
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
          {activeField ? (
            <Suspense fallback={<div className="bw-map-placeholder">{t("map.loading")}</div>}>
              <LocationMapPopover
                key={activeField}
                variant={activeField}
                value={activePoint}
                other={otherPoint}
                onConfirm={handleConfirm}
                onClose={() => setActiveField(null)}
              />
            </Suspense>
          ) : (
            <div className="bw-map-placeholder">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <p>{t("map.clickHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
