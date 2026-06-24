import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { fleetItems, WHATSAPP_URL } from "../data/content";
import { submitBooking } from "../api/booking";
import { formatPickupDisplay } from "../utils/datetime";
import { tripInvolvesAirport } from "../utils/airport";
import BookingConfirmModal from "./BookingConfirmModal";

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
    const handler = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
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
          <input
            ref={inputRef}
            type="text"
            className="phone-select-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="phone-select-list">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`phone-select-option ${c.code === value ? "phone-select-option--active" : ""}`}
                onClick={() => { onChange(c.code); setOpen(false); }}
              >
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

function TripSummaryCard({ bookingData, lang, t }) {
  const { type, pickupAt, from, to, durationHours } = bookingData;
  return (
    <div className="bd-trip-card">
      <h3 className="bd-section-label">{t("booking.details.tripSummary")}</h3>
      <div className="bd-trip-rows">
        <div className="bd-trip-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{formatPickupDisplay(new Date(pickupAt), lang)}</span>
        </div>
        <div className="bd-trip-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
          <span>{from || "—"}</span>
        </div>
        {type === "transfer" ? (
          <div className="bd-trip-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
            <span>{to || "—"}</span>
          </div>
        ) : (
          <div className="bd-trip-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>{durationHours}h</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CounterField({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="bd-counter">
      <span className="bd-counter-label">{label}</span>
      <div className="bd-counter-controls">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <span className="bd-counter-value">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

export default function BookingDetails({ bookingData, onBack }) {
  const { t, lang } = useI18n();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+90");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [childSeat, setChildSeat] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [notes, setNotes] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [meetAndGreetName, setMeetAndGreetName] = useState("");
  const [returnTransfer, setReturnTransfer] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const isAirportTrip = tripInvolvesAirport(bookingData.from, bookingData.to);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      setStatus("error");
      setMessage(t("booking.details.contactValidation"));
      return;
    }
    if (!selectedVehicle) {
      setStatus("error");
      setMessage(t("booking.details.vehicleValidation"));
      return;
    }

    setStatus("loading");
    try {
      const result = await submitBooking({
        ...bookingData,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: `${phoneCode}${phone.trim()}`,
        passengers,
        luggage,
        childSeat,
        vehicle: selectedVehicle,
        notes: notes.trim(),
        flightNumber: flightNumber.trim() || undefined,
        meetAndGreetName: meetAndGreetName.trim() || undefined,
        returnTransfer,
      });
      setStatus("success");
      setReference(result.reference);
      setMessage(t("booking.details.success", { ref: result.reference }));

      const vehicleName = t(`fleet.items.${selectedVehicle}.name`) !== `fleet.items.${selectedVehicle}.name`
        ? t(`fleet.items.${selectedVehicle}.name`)
        : selectedVehicle;
      const route = bookingData.type === "hourly"
        ? `${bookingData.from} (${bookingData.durationHours}h)`
        : `${bookingData.from} → ${bookingData.to}`;
      setConfirmed({
        reference: result.reference,
        customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        dateText: formatPickupDisplay(new Date(bookingData.pickupAt), lang),
        pickupAt: bookingData.pickupAt,
        durationHours: bookingData.type === "hourly" ? bookingData.durationHours : 2,
        route,
        vehicleName,
        passengers,
        phone: `${phoneCode}${phone.trim()}`,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error.code === "API_UNAVAILABLE"
        ? t("booking.details.serverUnavailable")
        : t("booking.details.error"));
    }
  };

  return (
    <div className="bd-page">
      <div className="bd-container">
        <header className="bd-header">
          <button type="button" className="bd-back" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            {t("booking.details.back")}
          </button>
          <h1 className="bd-title">{t("booking.details.title")}</h1>
        </header>

        <TripSummaryCard bookingData={bookingData} lang={lang} t={t} />

        <form className="bd-form" onSubmit={handleConfirm}>
          {/* Contact */}
          <section className="bd-section">
            <h3 className="bd-section-label">{t("booking.details.contactTitle")}</h3>
            <div className="bd-row-2">
              <label className="bd-field">
                <span>{t("booking.details.firstName")}</span>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              </label>
              <label className="bd-field">
                <span>{t("booking.details.lastName")}</span>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </label>
            </div>
            <label className="bd-field">
              <span>{t("booking.details.email")}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <div className="bd-field">
              <span>{t("booking.details.phone")}</span>
              <div className="bd-phone-row">
                <PhoneCodeSelect value={phoneCode} onChange={setPhoneCode} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </div>
            </div>
          </section>

          {/* Airport extras */}
          {isAirportTrip && (
            <section className="bd-section">
              <h3 className="bd-section-label">{t("booking.airportExtras")}</h3>
              <label className="bd-field">
                <span>{t("booking.flightNumber")}</span>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder={t("booking.flightPlaceholder")}
                />
              </label>
              <label className="bd-field">
                <span>{t("booking.meetAndGreet")}</span>
                <input
                  type="text"
                  value={meetAndGreetName}
                  onChange={(e) => setMeetAndGreetName(e.target.value)}
                  placeholder={t("booking.meetAndGreetPlaceholder")}
                />
              </label>
              <label className="bd-checkbox">
                <input
                  type="checkbox"
                  checked={returnTransfer}
                  onChange={(e) => setReturnTransfer(e.target.checked)}
                />
                <span>{t("booking.returnTransfer")}</span>
              </label>
            </section>
          )}

          {/* Passengers */}
          <section className="bd-section">
            <h3 className="bd-section-label">{t("booking.details.passengersTitle")}</h3>
            <div className="bd-counters">
              <CounterField label={t("booking.details.passengers")} value={passengers} onChange={setPassengers} min={1} max={16} />
              <CounterField label={t("booking.details.luggage")} value={luggage} onChange={setLuggage} min={0} max={20} />
              <CounterField label={t("booking.details.childSeat")} value={childSeat} onChange={setChildSeat} min={0} max={4} />
            </div>
          </section>

          {/* Vehicle */}
          <section className="bd-section">
            <h3 className="bd-section-label">{t("booking.details.vehicleTitle")}</h3>
            <div className="bd-vehicle-grid">
              {fleetItems.map((item) => {
                const info = t(`fleet.items.${item.key}.name`) !== `fleet.items.${item.key}.name`
                  ? {
                      name: t(`fleet.items.${item.key}.name`),
                      passengers: t(`fleet.items.${item.key}.passengers`),
                      bags: t(`fleet.items.${item.key}.bags`),
                    }
                  : { name: item.key, passengers: "", bags: "" };

                const active = selectedVehicle === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`bd-vehicle-card ${active ? "bd-vehicle-card--active" : ""}`}
                    onClick={() => setSelectedVehicle(item.key)}
                  >
                    {item.popular && (
                      <span className="bd-vehicle-badge">{t("booking.mostPopular")}</span>
                    )}
                    <img src={item.image} alt={info.name} loading="lazy" className="bd-vehicle-img" />
                    <div className="bd-vehicle-info">
                      <strong>{info.name}</strong>
                      <span>{info.passengers} · {info.bags}</span>
                    </div>
                    {active && (
                      <div className="bd-vehicle-check">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Notes */}
          <section className="bd-section">
            <h3 className="bd-section-label">{t("booking.details.notesTitle")}</h3>
            <textarea
              className="bd-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("booking.details.notesPlaceholder")}
            />
          </section>

          {message && (
            <div className={`bd-feedback bd-feedback--${status}`} role="status">
              <p>{message}</p>
              {status === "success" && reference && (
                <a
                  className="bd-whatsapp-success"
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hello, my booking reference is ${reference}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("booking.details.successWhatsApp")}
                </a>
              )}
            </div>
          )}

          <button className="bd-submit" type="submit" disabled={status === "loading" || status === "success"}>
            {status === "loading" ? t("booking.details.confirming") : t("booking.details.confirm")}
          </button>
        </form>
      </div>

      {confirmed && (
        <BookingConfirmModal booking={confirmed} onClose={() => setConfirmed(null)} />
      )}
    </div>
  );
}
