import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import LocationMapField, { locationLabel } from "./LocationMapField";
import PickupDateTimeField, { createDefaultPickupISO } from "./PickupDateTimeField";

function FromIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3" className="field-icon dot-gold">
      <circle cx="12" cy="12" r="8" fill="#ffffff" />
      <circle cx="12" cy="12" r="3" fill="#d4af37" />
    </svg>
  );
}

function ToIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="3" className="field-icon dot-charcoal">
      <circle cx="12" cy="12" r="8" fill="#ffffff" />
      <circle cx="12" cy="12" r="3" fill="#171717" />
    </svg>
  );
}

export default function BookingForm({ visible, onSearch }) {
  const { t } = useI18n();
  const [bookingType, setBookingType] = useState("transfer");
  const [pickupAt, setPickupAt] = useState(createDefaultPickupISO);
  const [fromPoint, setFromPoint] = useState(null);
  const [toPoint, setToPoint] = useState(null);
  const [durationHours, setDurationHours] = useState("4");
  const [message, setMessage] = useState("");

  const swapDirections = () => {
    setFromPoint(toPoint);
    setToPoint(fromPoint);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    const from = locationLabel(fromPoint);
    const to = locationLabel(toPoint);

    if (!pickupAt || !from.trim()) {
      setMessage(bookingType === "hourly" ? t("booking.hourlyValidation") : t("booking.validation"));
      return;
    }

    if (bookingType === "transfer" && !to.trim()) {
      setMessage(t("booking.validation"));
      return;
    }

    if (bookingType === "hourly" && (!durationHours || Number(durationHours) < 1)) {
      setMessage(t("booking.hourlyValidation"));
      return;
    }

    const data = {
      type: bookingType,
      pickupAt,
      from,
      to: bookingType === "hourly" ? undefined : to,
      durationHours: bookingType === "hourly" ? Number(durationHours) : undefined,
      fromCoords: fromPoint ? { lng: fromPoint.lng, lat: fromPoint.lat } : undefined,
      toCoords: toPoint ? { lng: toPoint.lng, lat: toPoint.lat } : undefined,
    };

    window.scrollTo({ top: 0, behavior: "smooth" });
    onSearch(data);
  };

  return (
    <form className={`booking-form ${visible ? "visible" : ""}`} id="booking" onSubmit={handleSubmit}>
      <div className="booking-tabs" aria-label="Booking type">
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

      <div className="form-fields">
        <div className="field-group field-group--datetime">
          <PickupDateTimeField
            value={pickupAt}
            onChange={setPickupAt}
            showEndTime={bookingType === "hourly"}
            onDurationChange={setDurationHours}
          />
        </div>

        <div className="field-group field-group--location">
          <LocationMapField
            id="from-where"
            variant="from"
            label={t("booking.fromLabel")}
            placeholder={t("booking.fromPlaceholder")}
            value={fromPoint}
            other={toPoint}
            onChange={setFromPoint}
            icon={<FromIcon />}
          />
        </div>

        {bookingType === "transfer" ? (
          <div className="field-group field-group--location">
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
            />
          </div>
        ) : (
          <input type="hidden" name="duration-hours" value={durationHours} />
        )}
      </div>

      <button className="btn-search" type="submit">
        {t("booking.search")}
      </button>

      {message && (
        <p className="booking-feedback booking-feedback--error" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
