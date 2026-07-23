import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { formatPickupDisplay } from "../../utils/datetime";

const PassengerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
  </svg>
);

const LuggageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);

const BabyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12h.01"/>
    <path d="M15 12h.01"/>
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>
    <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>
  </svg>
);

function CounterField({ icon, label, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="bw-counter">
      <div className="bw-counter-left">
        <span className="bw-counter-icon">{icon}</span>
        <span className="bw-counter-label">{label}</span>
      </div>
      <div className="bw-counter-controls">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <span className="bw-counter-value">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

export { CounterField };

export default function TripSidebar({
  tripData,
  stops = [],
  passengers,
  luggage,
  childSeat = 0,
  selectedVehicle,
  vehicleName,
  contact,
  onPassengersChange,
  onLuggageChange,
  onChildSeatChange,
  onAddStops,
  editable = false,
  showCounters = false,
  showVehicle = false,
  showGuest = false,
  onEdit,
}) {
  const { t, lang } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const { type, pickupAt, from, to, durationHours } = tripData;

  return (
    <aside className="bw-sidebar">
      <button
        type="button"
        className="bw-sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className="bw-sidebar-trip-label">Trip 1</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`bw-sidebar-chevron ${collapsed ? "" : "bw-sidebar-chevron--open"}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {!collapsed && (
        <div className="bw-sidebar-body">
          {/* Date */}
          <div className="bw-sidebar-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{formatPickupDisplay(new Date(pickupAt), lang)}</span>
            {onEdit && <button type="button" className="bw-sidebar-edit" onClick={() => onEdit(1)}>{t("wizard.edit")}</button>}
          </div>

          {/* From */}
          <div className="bw-sidebar-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
            <div className="bw-sidebar-loc">
              <span>{from || "—"}</span>
            </div>
            {onEdit && <button type="button" className="bw-sidebar-edit" onClick={() => onEdit(1)}>{t("wizard.edit")}</button>}
          </div>

          {/* Stops */}
          {stops.map((stop, i) => (
            <div className="bw-sidebar-row bw-sidebar-row--stop" key={i}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
              <span>{stop}</span>
            </div>
          ))}

          {/* To */}
          {type === "transfer" ? (
            <div className="bw-sidebar-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="3"><circle cx="12" cy="12" r="4"/></svg>
              <span>{to || "—"}</span>
            </div>
          ) : (
            <div className="bw-sidebar-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>{durationHours}h</span>
            </div>
          )}

          {/* Add stops */}
          {editable && onAddStops && (
            <button type="button" className="bw-add-stops" onClick={onAddStops}>
              + {t("wizard.addStops")}
            </button>
          )}

          {/* Counters */}
          {showCounters && onPassengersChange && onLuggageChange && (
            <div className="bw-sidebar-counters">
              <CounterField icon={<PassengerIcon />} label={t("booking.details.passengers")} value={passengers} onChange={onPassengersChange} min={1} max={16} />
              <CounterField icon={<LuggageIcon />} label={t("booking.details.luggage")} value={luggage} onChange={onLuggageChange} min={0} max={20} />
              <CounterField icon={<BabyIcon />} label={t("booking.details.baby")} value={childSeat} onChange={onChildSeatChange} min={0} max={4} />
            </div>
          )}

          {/* Passenger/luggage read-only */}
          {!showCounters && passengers != null && (
            <div className="bw-sidebar-meta">
              <div className="bw-sidebar-meta-item"><PassengerIcon /> <span>{passengers}</span></div>
              <div className="bw-sidebar-meta-item"><LuggageIcon /> <span>{luggage}</span></div>
              {childSeat > 0 && <div className="bw-sidebar-meta-item"><BabyIcon /> <span>{childSeat}</span></div>}
            </div>
          )}

          {/* Vehicle */}
          {showVehicle && selectedVehicle && (
            <div className="bw-sidebar-vehicle">
              <strong>{t("wizard.service")}</strong>
              <span>{vehicleName}</span>
              {onEdit && <button type="button" className="bw-sidebar-edit" onClick={() => onEdit(2)}>{t("wizard.edit")}</button>}
            </div>
          )}

          {/* Guest */}
          {showGuest && contact?.firstName && (
            <div className="bw-sidebar-guest">
              <strong>{t("wizard.guestInfo")}</strong>
              <span>{contact.firstName} {contact.lastName}</span>
              <span className="bw-sidebar-guest-detail">{contact.email} · {contact.phoneCode}{contact.phone}</span>
              {onEdit && <button type="button" className="bw-sidebar-edit" onClick={() => onEdit(3)}>{t("wizard.edit")}</button>}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
