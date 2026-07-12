import { useEffect, useState } from "react";
import { fetchOperations } from "../api/admin";
import { toDateInput } from "./utils";
import StatusBadge from "./components/StatusBadge";
import { WHATSAPP_URL } from "../data/content";
import AdminToolbar from "./components/AdminToolbar";

function formatTime(iso, time) {
  if (time) return time;
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function customerName(item) {
  if (item.customer) return `${item.customer.firstName} ${item.customer.lastName || ""}`.trim();
  if (item.passenger) return `${item.passenger.firstName} ${item.passenger.lastName || ""}`.trim();
  return "—";
}

export default function OperationsView({ navigate }) {
  const [date, setDate] = useState(toDateInput(new Date()));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchOperations(date)
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const whatsappLink = (phone, ref) => {
    const p = phone || "";
    return `${WHATSAPP_URL}?text=${encodeURIComponent(`Merhaba, ${ref} transferiniz hakkında.`)}`;
  };

  return (
    <>
      <AdminToolbar>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Tarih" />
        <button type="button" className="admin-btn admin-btn--ghost" onClick={load}>Yenile</button>
      </AdminToolbar>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Bu gün için transfer yok</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="admin-booking-card">
            <div className="admin-booking-card-header">
              <strong>{formatTime(item.transferDate, item.transferTime)} — {customerName(item)}</strong>
              <StatusBadge status={item.status} />
            </div>
            <div className="admin-booking-card-route">
              {item.fromLabel} → {item.toLabel}
            </div>
            <div className="admin-booking-card-meta">
              #{item.reference}
              {item.flightCode && ` · Uçuş: ${item.flightCode}`}
              {item.supplier && ` · Tedarikçi: ${item.supplier.name}`}
              {item.assignedDriver && ` · Sürücü: ${item.assignedDriver.name}`}
            </div>
            <div className="admin-detail-actions" style={{ marginTop: 12 }}>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("reservation-detail", item.reservationId)}>
                Detay
              </button>
              <a
                className="admin-btn admin-btn--gold"
                href={whatsappLink(item.customer?.phone || item.customer?.whatsapp, item.reference)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))
      )}
    </>
  );
}
