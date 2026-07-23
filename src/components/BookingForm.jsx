import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import LocationMapField, { getSelectedAirport, locationLabel } from "./LocationMapField";
import PickupDateTimeField, { createDefaultPickupISO } from "./PickupDateTimeField";
import { requiresDestination, requiresDuration } from "../utils/bookingTypes";

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

function AirportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 16l8-2.5V8c0-1.1.9-2 2-2s2 .9 2 2v5.5L22 16v2l-8-2v4l2 1.5V23l-4-1-4 1v-1.5L12 20v-4L2 18v-2z" />
    </svg>
  );
}

function ChauffeurIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="10" width="18" height="7" rx="2" />
      <path d="M5 10 7.5 6h9L19 10" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </svg>
  );
}

function HourlyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M14 19c.3-2 1.8-3.5 4-3.5 1.8 0 3.2 1 3.7 2.5" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
      <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 16V4M7 4l3.5 3.5M7 4 3.5 7.5" />
      <path d="M17 8v12M17 20l3.5-3.5M17 20 13.5 16.5" />
    </svg>
  );
}

const TABS = [
  { id: "transfer", icon: AirportIcon },
  { id: "chauffeur", icon: ChauffeurIcon },
  { id: "hourly", icon: HourlyIcon },
  { id: "group", icon: GroupIcon },
  { id: "events", icon: EventsIcon },
];

export default function BookingForm({ visible, onSearch }) {
  const { t } = useI18n();
  const [bookingType, setBookingType] = useState("transfer");
  const [pickupAt, setPickupAt] = useState(createDefaultPickupISO);
  const [fromPoint, setFromPoint] = useState(null);
  const [toPoint, setToPoint] = useState(null);
  const [durationHours, setDurationHours] = useState("4");
  const [passengers, setPassengers] = useState(2);
  const [roundTrip, setRoundTrip] = useState(false);
  const [message, setMessage] = useState("");

  const needsTo = requiresDestination(bookingType);
  const fromAirport = getSelectedAirport(fromPoint);
  const toAirport = getSelectedAirport(toPoint);
  // Group transfers can accommodate large parties (mini-buses / coaches).
  const passengerMax = bookingType === "group" ? 50 : 16;

  // Keep passenger count within the current booking-type ceiling; when the
  // user switches away from Group (e.g. from 24 pax back to Transfer) we clamp
  // down to the smaller limit automatically.
  useEffect(() => {
    setPassengers((count) => {
      const parsed = Number(count);
      if (!Number.isFinite(parsed) || parsed < 1) return 1;
      return Math.min(passengerMax, Math.round(parsed));
    });
  }, [passengerMax]);

  const swapDirections = () => {
    setFromPoint(toPoint);
    setToPoint(fromPoint);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    const from = locationLabel(fromPoint);
    const to = locationLabel(toPoint);
    const needsDuration = requiresDuration(bookingType);

    if (!pickupAt || !from.trim()) {
      setMessage(needsDuration ? t("booking.hourlyValidation") : t("booking.validation"));
      return;
    }

    if (needsTo && !to.trim()) {
      setMessage(t("booking.validation"));
      return;
    }

    if (needsDuration && (!durationHours || Number(durationHours) < 1)) {
      setMessage(t("booking.hourlyValidation"));
      return;
    }

    const passengerCount = Math.min(passengerMax, Math.max(1, Number(passengers) || 1));

    const data = {
      type: bookingType,
      pickupAt,
      from,
      to: needsTo ? to : undefined,
      durationHours: needsDuration ? Number(durationHours) : undefined,
      fromCoords: fromPoint?.lng != null ? { lng: fromPoint.lng, lat: fromPoint.lat } : undefined,
      toCoords: toPoint?.lng != null && needsTo ? { lng: toPoint.lng, lat: toPoint.lat } : undefined,
      passengers: passengerCount,
      roundTrip,
    };

    window.scrollTo({ top: 0, behavior: "smooth" });
    onSearch(data);
  };

  return (
    <form className={`booking-form booking-form--bar ${visible ? "visible" : ""}`} id="booking" onSubmit={handleSubmit}>
      <div className="booking-tabs" aria-label="Booking type" role="tablist">
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={bookingType === id}
            aria-label={t(`booking.types.${id}`)}
            className={bookingType === id ? "active" : ""}
            onClick={() => setBookingType(id)}
          >
            <Icon />
            <span className="booking-tab-label booking-tab-label--full">{t(`booking.types.${id}`)}</span>
            <span className="booking-tab-label booking-tab-label--short">{t(`booking.typesShort.${id}`)}</span>
          </button>
        ))}
      </div>

      <div className="form-fields">
        <div className={`field-stack field-stack--route ${needsTo ? "" : "field-stack--single"}`}>
          <div className="field-group field-group--location field-group--from">
            <LocationMapField
              id="from-where"
              variant="from"
              label={t("booking.fromLabel")}
              placeholder={t("booking.fromPlaceholder")}
              value={fromPoint}
              other={toPoint}
              onChange={setFromPoint}
              icon={<FromIcon />}
              destinationAirport={toAirport}
            />
          </div>

          {needsTo ? (
            <>
              <button
                type="button"
                className="route-swap-btn"
                onClick={swapDirections}
                aria-label={t("booking.swap")}
              >
                <SwapIcon />
              </button>
              <div className="field-group field-group--location field-group--to">
                <LocationMapField
                  id="to-where"
                  variant="to"
                  label={t("booking.toLabel")}
                  placeholder={t("booking.toPlaceholder")}
                  value={toPoint}
                  other={fromPoint}
                  onChange={setToPoint}
                  icon={<ToIcon />}
                  showSwap
                  onSwap={swapDirections}
                  destinationAirport={fromAirport}
                />
              </div>
            </>
          ) : (
            <div className="field-group field-group--duration">
              <label htmlFor="duration-hours" className="field-label">{t("booking.durationLabel")}</label>
              <div className="field-input-wrapper">
                <input
                  id="duration-hours"
                  type="number"
                  min="1"
                  max="24"
                  inputMode="numeric"
                  value={durationHours}
                  onChange={(event) => setDurationHours(event.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="field-row field-row--datetime">
          <div className="field-group field-group--date">
            <PickupDateTimeField mode="date" value={pickupAt} onChange={setPickupAt} />
          </div>

          <div className="field-group field-group--time">
            <PickupDateTimeField mode="time" value={pickupAt} onChange={setPickupAt} />
          </div>
        </div>

        <div className="field-group field-group--passengers">
          <label className="field-label" htmlFor="passenger-count">{t("booking.passengersLabel")}</label>
          <div className="field-input-wrapper passenger-stepper">
            <button
              type="button"
              className="passenger-stepper-btn"
              onClick={() => setPassengers((count) => Math.max(1, Number(count || 1) - 1))}
              disabled={Number(passengers || 1) <= 1}
              aria-label="-"
            >
              −
            </button>
            <input
              id="passenger-count"
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
                setPassengers(Math.min(passengerMax, Math.max(1, Math.round(parsed))));
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
              onClick={() => setPassengers((count) => Math.min(passengerMax, Number(count || 1) + 1))}
              disabled={Number(passengers) >= passengerMax}
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>

        <div className="field-group field-group--submit">
          <label className="booking-roundtrip booking-roundtrip--inline">
            <input
              type="checkbox"
              checked={roundTrip}
              onChange={(event) => setRoundTrip(event.target.checked)}
            />
            <span>{t("booking.roundTrip")}</span>
          </label>
          <button className="btn-search" type="submit">
            {t("booking.seePrices")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {message && (
        <p className="booking-feedback booking-feedback--error" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
