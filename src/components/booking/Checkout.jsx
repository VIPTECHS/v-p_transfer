import { useI18n } from "../../i18n/I18nContext";
import { formatPickupDisplay } from "../../utils/datetime";
import { fleetItems } from "../../data/content";

export default function Checkout({ state, dispatch, onEdit, onSubmit, status, message }) {
  const { t, lang } = useI18n();
  const { tripData, selectedVehicle, passengers, luggage, contact, stops, termsAccepted } = state;

  const vehicleData = fleetItems.find((f) => f.key === selectedVehicle);
  const vehicleName = selectedVehicle
    ? (t(`fleet.items.${selectedVehicle}.name`) !== `fleet.items.${selectedVehicle}.name` ? t(`fleet.items.${selectedVehicle}.name`) : selectedVehicle)
    : "";
  const vehiclePassengers = selectedVehicle
    ? (t(`fleet.items.${selectedVehicle}.passengers`) !== `fleet.items.${selectedVehicle}.passengers` ? t(`fleet.items.${selectedVehicle}.passengers`) : "")
    : "";
  const vehicleBags = selectedVehicle
    ? (t(`fleet.items.${selectedVehicle}.bags`) !== `fleet.items.${selectedVehicle}.bags` ? t(`fleet.items.${selectedVehicle}.bags`) : "")
    : "";

  return (
    <div className="bw-layout bw-layout--checkout">
      {/* Right: Confirmation */}
      <div className="bw-checkout-left">
        <h2 className="bw-page-title">{t("wizard.reviewBooking")}</h2>
        <p className="bw-confirm-note">{t("wizard.reservationOnlyNote")}</p>

        {/* Terms */}
        <label className="bw-terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => dispatch({ type: "SET_TERMS", payload: e.target.checked })}
          />
          <span>
            {t("wizard.termsPrefix")}{" "}
            <a href="/terms" target="_blank" rel="noopener">{t("wizard.termsOfService")}</a>
            {" "}{t("wizard.and")}{" "}
            <a href="/privacy" target="_blank" rel="noopener">{t("wizard.privacyPolicy")}</a>
          </span>
        </label>

        {message && (
          <div className={`bw-feedback bw-feedback--${status}`} role="status">
            <p>{message}</p>
          </div>
        )}

        <button
          type="button"
          className="bw-book-btn"
          onClick={onSubmit}
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? t("booking.details.confirming") : t("wizard.bookNow")}
        </button>
      </div>

      {/* Right: Trip summary */}
      <div className="bw-checkout-right">
        {/* Date */}
        <div className="bw-review-section">
          <div className="bw-review-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{formatPickupDisplay(new Date(tripData.pickupAt), lang)}</span>
            <button type="button" className="bw-review-edit" onClick={() => onEdit(1)}>{t("wizard.edit")}</button>
          </div>
        </div>

        {/* Route */}
        <div className="bw-review-section">
          <div className="bw-review-route">
            <div className="bw-review-loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
              <div>
                <strong>{tripData.from}</strong>
              </div>
            </div>
            {stops.map((stop, i) => (
              <div className="bw-review-loc bw-review-loc--stop" key={i}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                <span>{stop}</span>
              </div>
            ))}
            {tripData.type === "transfer" && (
              <div className="bw-review-loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
                <div>
                  <strong>{tripData.to}</strong>
                </div>
              </div>
            )}
          </div>
          <div className="bw-review-meta">
            <span>👤 {passengers} {t("booking.details.passengers")}</span>
            <span>🧳 {luggage} {t("booking.details.luggage")}</span>
          </div>
        </div>

        {/* Service */}
        <div className="bw-review-section">
          <div className="bw-review-header">
            <span className="bw-review-label">{t("wizard.service")}</span>
            <button type="button" className="bw-review-edit" onClick={() => onEdit(2)}>{t("wizard.edit")}</button>
          </div>
          {vehicleData && (
            <div className="bw-review-vehicle">
              <img src={vehicleData.image} alt={vehicleName} className="bw-review-vehicle-img" />
              <div>
                <strong>{vehicleName}</strong>
                <span>{vehiclePassengers} · {vehicleBags}</span>
              </div>
            </div>
          )}
        </div>

        {/* Guest */}
        <div className="bw-review-section">
          <div className="bw-review-header">
            <span className="bw-review-label">{t("wizard.guestInfo")}</span>
            <button type="button" className="bw-review-edit" onClick={() => onEdit(3)}>{t("wizard.edit")}</button>
          </div>
          <div className="bw-review-guest">
            <p className="bw-review-guest-name">{contact.firstName} {contact.lastName}</p>
            <p className="bw-review-guest-detail">{contact.email} · {contact.phoneCode}{contact.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
