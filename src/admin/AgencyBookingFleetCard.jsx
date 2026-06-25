import { capacityStatus, resolveFleetSpec } from "../utils/fleetSpecs";

function PersonIcon({ filled, over }) {
  return (
    <svg viewBox="0 0 24 24" className={`agency-fleet-icon ${filled ? "agency-fleet-icon--filled" : ""} ${over ? "agency-fleet-icon--over" : ""}`} aria-hidden>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" />
    </svg>
  );
}

function LuggageIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={`agency-fleet-icon agency-fleet-icon--luggage ${filled ? "agency-fleet-icon--filled" : ""}`} aria-hidden>
      <rect x="6" y="8" width="12" height="11" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M12 12v4" />
    </svg>
  );
}

function CapacityRow({ label, used, max, kind }) {
  const status = capacityStatus(used, max);
  const fillPct = Math.min((used / max) * 100, 100);
  const overCount = Math.max(0, used - max);
  const slots = Math.max(max, used);

  return (
    <div className={`agency-capacity agency-capacity--${status}`}>
      <div className="agency-capacity-top">
        <span className="agency-capacity-label">{label}</span>
        <span className="agency-capacity-value">
          <strong>{used}</strong>
          <span className="agency-capacity-sep">/</span>
          {max}
          {status === "over" && <span className="agency-capacity-warn">Kapasite aşımı</span>}
        </span>
      </div>
      <div className="agency-capacity-track" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={max}>
        <div className="agency-capacity-fill" style={{ width: `${fillPct}%` }} />
        {status === "over" && <div className="agency-capacity-over" style={{ width: `${Math.min(((used - max) / max) * 100, 40)}%` }} />}
      </div>
      <div className="agency-capacity-icons">
        {Array.from({ length: slots }, (_, i) => {
          const isFilled = i < used;
          const isOver = i >= max;
          if (kind === "passenger") {
            return <PersonIcon key={i} filled={isFilled} over={isOver && isFilled} />;
          }
          return <LuggageIcon key={i} filled={isFilled && !isOver} />;
        })}
      </div>
      {overCount > 0 && (
        <p className="agency-capacity-note">
          Talep edilen {kind === "passenger" ? "yolcu" : "bagaj"} sayısı araç kapasitesini {overCount} {kind === "passenger" ? "kişi" : "parça"} aşıyor.
        </p>
      )}
    </div>
  );
}

export default function AgencyBookingFleetCard({ booking }) {
  const fleet = resolveFleetSpec(booking.vehicle);
  const passengers = Number(booking.passengers) || 0;
  const luggage = Number(booking.luggage) || 0;
  const childSeat = Number(booking.childSeat) || 0;

  if (!fleet) {
    return (
      <div className="admin-detail-section agency-fleet-card">
        <h3>Araç & Kapasite</h3>
        <p className="agency-fleet-empty">Araç tipi belirtilmemiş</p>
      </div>
    );
  }

  const pStatus = capacityStatus(passengers, fleet.passengerCap);
  const lStatus = capacityStatus(luggage, fleet.luggageCap);

  return (
    <div className="admin-detail-section agency-fleet-card">
      <h3>Araç & Kapasite</h3>
      <div className="agency-fleet-hero">
        <div className="agency-fleet-visual">
          {fleet.image ? (
            <img src={fleet.image} alt={fleet.name} className="agency-fleet-image" />
          ) : (
            <div className="agency-fleet-image agency-fleet-image--placeholder" />
          )}
          <div className="agency-fleet-badges">
            <span className="agency-fleet-type">{fleet.type}</span>
            {(pStatus === "over" || lStatus === "over") && (
              <span className="agency-fleet-alert">Dikkat</span>
            )}
          </div>
        </div>
        <div className="agency-fleet-info">
          <h4 className="agency-fleet-name">{fleet.name}</h4>
          <p className="agency-fleet-meta">Talep edilen araç sınıfı</p>
          <div className="agency-fleet-stats">
            <div className="agency-fleet-stat">
              <span className="agency-fleet-stat-num">{fleet.passengerCap}</span>
              <span className="agency-fleet-stat-lbl">Max yolcu</span>
            </div>
            <div className="agency-fleet-stat">
              <span className="agency-fleet-stat-num">{fleet.luggageCap}</span>
              <span className="agency-fleet-stat-lbl">Max bagaj</span>
            </div>
            {childSeat > 0 && (
              <div className="agency-fleet-stat agency-fleet-stat--accent">
                <span className="agency-fleet-stat-num">{childSeat}</span>
                <span className="agency-fleet-stat-lbl">Çocuk koltuğu</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="agency-fleet-capacity">
        <CapacityRow label="Yolcu kapasitesi" used={passengers} max={fleet.passengerCap} kind="passenger" />
        <CapacityRow label="Bagaj kapasitesi" used={luggage} max={fleet.luggageCap} kind="luggage" />
      </div>
    </div>
  );
}
