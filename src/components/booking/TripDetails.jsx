import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { defaultPickupDate, toPickupISO } from "../../utils/datetime";
import { BOOKING_TYPES, requiresDestination, requiresDuration } from "../../utils/bookingTypes";
import LocationMapField, { getSelectedAirport, locationLabel } from "../LocationMapField";

function pointFrom(label, coords) {
  if (!label) return null;
  return { label, lng: coords?.lng, lat: coords?.lat };
}

function FromIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="field-icon" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ToIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="field-icon" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function TripDetails({ state, dispatch, onContinue }) {
  const { t } = useI18n();
  const { tripData } = state;

  const [bookingType, setBookingType] = useState(tripData?.type || "transfer");
  const [pickupAt, setPickupAt] = useState(tripData?.pickupAt || toPickupISO(defaultPickupDate()));
  const [fromPoint, setFromPoint] = useState(pointFrom(tripData?.from, tripData?.fromCoords));
  const [toPoint, setToPoint] = useState(pointFrom(tripData?.to, tripData?.toCoords));
  const [durationHours, setDurationHours] = useState(String(tripData?.durationHours || "4"));
  // Group transfers (mini-bus / coach) can carry a larger party than the
  // usual sedan/van fleet; keep the ceiling in sync with the home form.
  const passengerMax = bookingType === "group" ? 50 : 16;
  const initialPassengers = Math.max(
    1,
    Math.min(passengerMax, Number(state.passengers) || 1),
  );
  const [passengers, setPassengers] = useState(initialPassengers);
  const [message, setMessage] = useState("");

  const minPickup = toPickupISO(new Date());
  const hasCoords = (p) => p && p.lng != null && p.lat != null;

  // When the tab is switched (e.g. Group → Transfer) clamp the count so the
  // number never exceeds the new fleet's ceiling.
  useEffect(() => {
    setPassengers((count) => {
      const parsed = Number(count);
      if (!Number.isFinite(parsed) || parsed < 1) return 1;
      return Math.min(passengerMax, Math.round(parsed));
    });
  }, [passengerMax]);

  // Same symmetric behavior as the home page BookingForm: if one side is a
  // known airport, the other side proposes popular destinations in that
  // airport's city instead of airports.
  const fromAirport = getSelectedAirport(fromPoint);
  const toAirport = getSelectedAirport(toPoint);
  const needsTo = requiresDestination(bookingType);

  const swapDirections = () => {
    setFromPoint(toPoint);
    setToPoint(fromPoint);
  };

  const handleContinue = (event) => {
    event.preventDefault();
    setMessage("");

    const from = locationLabel(fromPoint).trim();
    const to = locationLabel(toPoint).trim();
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

    const passengerCount = Math.max(
      1,
      Math.min(passengerMax, Number(passengers) || 1),
    );

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
    // Persist the passenger count so the next steps (Service selection,
    // Sidebar summary, Checkout) all reflect the number the guest picked
    // here — no need to re-enter it later.
    dispatch({ type: "SET_PASSENGERS", payload: passengerCount });
    onContinue();
  };

  return (
    <div className="bw-main bw-trip-edit">
      <h2 className="bw-page-title">{t("wizard.steps.search")}</h2>

      <div className="bw-trip-layout bw-trip-layout--single">
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

          <div className="bw-trip-locations">
            <LocationMapField
              id="bw-from-where"
              variant="from"
              label={t("booking.fromLabel")}
              placeholder={t("booking.fromPlaceholder")}
              value={fromPoint}
              other={toPoint}
              onChange={setFromPoint}
              icon={<FromIcon />}
              destinationAirport={toAirport}
            />

            {needsTo ? (
              <LocationMapField
                id="bw-to-where"
                variant="to"
                label={t("booking.toLabel")}
                placeholder={t("booking.toPlaceholder")}
                value={toPoint}
                other={fromPoint}
                onChange={setToPoint}
                icon={<ToIcon />}
                destinationAirport={fromAirport}
                showSwap
                onSwap={swapDirections}
              />
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
          </div>

          {bookingType === "group" && (
            <div className="vehicle-book-field bw-trip-passengers">
              <span>{t("booking.passengersLabel")}</span>
              <div className="passenger-stepper">
                <button
                  type="button"
                  className="passenger-stepper-btn"
                  onClick={() =>
                    setPassengers((count) => Math.max(1, Number(count || 1) - 1))
                  }
                  disabled={Number(passengers || 1) <= 1}
                  aria-label="-"
                >
                  −
                </button>
                <input
                  className="passenger-stepper-input"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={passengerMax}
                  value={passengers}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "") {
                      setPassengers("");
                      return;
                    }
                    const parsed = Number(next);
                    if (!Number.isFinite(parsed)) return;
                    setPassengers(
                      Math.min(passengerMax, Math.max(1, Math.round(parsed))),
                    );
                  }}
                  onBlur={() => {
                    setPassengers((count) => {
                      const parsed = Number(count);
                      if (!Number.isFinite(parsed) || parsed < 1) return 1;
                      return Math.min(passengerMax, Math.round(parsed));
                    });
                  }}
                />
                <button
                  type="button"
                  className="passenger-stepper-btn"
                  onClick={() =>
                    setPassengers((count) =>
                      Math.min(passengerMax, Number(count || 1) + 1),
                    )
                  }
                  disabled={Number(passengers) >= passengerMax}
                  aria-label="+"
                >
                  +
                </button>
              </div>
            </div>
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
      </div>
    </div>
  );
}
