import { useEffect, useState } from "react";
import { fetchOperations, updateBooking } from "../api/admin";
import { customerName, formatTime, statusLabel, toDateInput } from "./utils";
import { WHATSAPP_URL } from "../data/content";

export default function OperationsView({ navigate }) {
  const [date, setDate] = useState(toDateInput(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchOperations(date)
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const whatsappLink = (b, msg) =>
    `${WHATSAPP_URL}?text=${encodeURIComponent(msg || `Merhaba ${customerName(b)}, ${b.reference} transferiniz hakkında.`)}`;

  return (
    <>
      <h1 className="admin-page-title">Operasyon</h1>
      <div className="admin-filters">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button type="button" className="admin-btn admin-btn--ghost" onClick={load}>Yenile</button>
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : bookings.length === 0 ? (
        <div className="admin-empty">Bu gün için transfer yok</div>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="admin-booking-card">
            <div className="admin-booking-card-header">
              <strong>{formatTime(b.pickupAt)} — {customerName(b)}</strong>
              <span className={`admin-badge admin-badge--${b.status}`}>{statusLabel(b.status)}</span>
            </div>
            <div className="admin-booking-card-route">
              {b.fromLabel} → {b.toLabel || `${b.durationHours}sa`}
            </div>
            <div className="admin-booking-card-meta">
              {b.flightNumber && `Uçuş: ${b.flightNumber} · `}
              {b.phone} · {b.vehicle || "Araç atanmadı"}
              {b.assignedDriver && ` · Şoför: ${b.assignedDriver.name}`}
            </div>
            <div className="admin-detail-actions" style={{ marginTop: 12 }}>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("booking-detail", b.id)}>
                Detay
              </button>
              <a className="admin-btn admin-btn--gold" href={whatsappLink(b)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              {b.status === "pending" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => updateBooking(b.id, { status: "confirmed" }).then(load)}
                >
                  Onayla
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
}
