import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { tripInvolvesAirport } from "../../utils/airport";
import TripSidebar from "./TripSidebar";

const COUNTRIES = [
  { code: "+90", flag: "🇹🇷", name: "Türkiye" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
];

function PhoneCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", esc); };
  }, [open]);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const filtered = search
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
    : COUNTRIES;

  return (
    <div className="phone-select" ref={rootRef}>
      <button type="button" className="phone-select-trigger" onClick={() => { setOpen(!open); setSearch(""); }}>
        <span className="phone-select-flag">{selected.flag}</span>
        <span className="phone-select-code">{selected.code}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="phone-select-dropdown">
          <input ref={inputRef} type="text" className="phone-select-search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="phone-select-list">
            {filtered.map((c) => (
              <button key={c.code} type="button" className={`phone-select-option ${c.code === value ? "phone-select-option--active" : ""}`} onClick={() => { onChange(c.code); setOpen(false); }}>
                <span className="phone-select-flag">{c.flag}</span>
                <span className="phone-select-name">{c.name}</span>
                <span className="phone-select-optcode">{c.code}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="phone-select-empty">—</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PickupInfo({ state, dispatch }) {
  const { t } = useI18n();
  const { tripData, contact, flightNumber, meetAndGreetName, returnTransfer, notes, selectedVehicle, passengers, luggage, stops } = state;
  const isAirport = tripInvolvesAirport(tripData.from, tripData.to);

  const vehicleName = selectedVehicle
    ? (t(`fleet.items.${selectedVehicle}.name`) !== `fleet.items.${selectedVehicle}.name` ? t(`fleet.items.${selectedVehicle}.name`) : selectedVehicle)
    : "";

  const setContact = (field, value) => dispatch({ type: "SET_CONTACT", payload: { ...contact, [field]: value } });

  return (
    <div className="bw-layout">
      <TripSidebar
        tripData={tripData}
        stops={stops}
        passengers={passengers}
        luggage={luggage}
        childSeat={state.childSeat}
        pets={state.pets}
        selectedVehicle={selectedVehicle}
        vehicleName={vehicleName}
        showVehicle
      />

      <div className="bw-main">
        {/* Contact */}
        <section className="bw-section">
          <h2 className="bw-page-title">{t("wizard.passengerContact")}</h2>
          <div className="bw-form-grid">
            <label className="bw-field">
              <span>{t("booking.details.firstName")} <span className="bw-req">*</span></span>
              <input type="text" value={contact.firstName} onChange={(e) => setContact("firstName", e.target.value)} autoComplete="given-name" />
            </label>
            <label className="bw-field">
              <span>{t("booking.details.lastName")} <span className="bw-req">*</span></span>
              <input type="text" value={contact.lastName} onChange={(e) => setContact("lastName", e.target.value)} autoComplete="family-name" />
            </label>
          </div>
          <div className="bw-form-grid">
            <label className="bw-field">
              <span>{t("booking.details.email")} <span className="bw-req">*</span></span>
              <input type="email" value={contact.email} onChange={(e) => setContact("email", e.target.value)} autoComplete="email" />
            </label>
            <div className="bw-field">
              <span>{t("booking.details.phone")} <span className="bw-req">*</span></span>
              <div className="bw-phone-row">
                <PhoneCodeSelect value={contact.phoneCode} onChange={(v) => setContact("phoneCode", v)} />
                <input type="tel" value={contact.phone} onChange={(e) => setContact("phone", e.target.value)} autoComplete="tel" />
              </div>
            </div>
          </div>
        </section>

        {/* Additional info */}
        <section className="bw-section">
          <h3 className="bw-section-title">{t("wizard.additionalInfo")}</h3>
          {isAirport && (
            <label className="bw-field">
              <span>{t("booking.flightNumber")}</span>
              <p className="bw-field-hint">{t("wizard.flightHint")}</p>
              <input type="text" value={flightNumber} onChange={(e) => dispatch({ type: "SET_FLIGHT", payload: e.target.value.toUpperCase() })} placeholder={t("booking.flightPlaceholder")} />
            </label>
          )}
          <label className="bw-field">
            <span>{t("wizard.driverNotes")}</span>
            <textarea
              className="bw-textarea"
              rows={3}
              value={notes}
              onChange={(e) => dispatch({ type: "SET_NOTES", payload: e.target.value })}
              placeholder={t("booking.details.notesPlaceholder")}
            />
          </label>
        </section>

        {/* Extras */}
        {isAirport && (
          <section className="bw-section">
            <h3 className="bw-section-title">{t("wizard.extras")}</h3>
            <div className="bw-extra-row">
              <div>
                <span>{t("wizard.airportFee")} <span className="bw-req">*</span></span>
              </div>
              <span className="bw-extra-included">{t("wizard.included")}</span>
            </div>
            <label className="bw-checkbox">
              <input type="checkbox" checked={returnTransfer} onChange={(e) => dispatch({ type: "SET_RETURN", payload: e.target.checked })} />
              <span>{t("booking.returnTransfer")}</span>
            </label>
            {isAirport && (
              <label className="bw-field">
                <span>{t("booking.meetAndGreet")}</span>
                <input type="text" value={meetAndGreetName} onChange={(e) => dispatch({ type: "SET_MEET_GREET", payload: e.target.value })} placeholder={t("booking.meetAndGreetPlaceholder")} />
              </label>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
