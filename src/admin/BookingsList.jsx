import { useEffect, useState } from "react";
import { fetchBookings } from "../api/admin";
import { customerName, formatDateTime, statusLabel } from "./utils";

const STATUSES = [
  { value: "", label: "Tüm durumlar" },
  { value: "pending", label: "Bekliyor" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "assigned", label: "Atandı" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
];

export default function BookingsList({ navigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchBookings({ status: status || undefined, q: q || undefined, from: from || undefined, to: to || undefined })
      .then(setBookings)
      .catch(() => setError("Randevular yüklenemedi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <>
      <h1 className="admin-page-title">Randevular</h1>
      {error && <div className="admin-error">{error}</div>}

      <form className="admin-filters" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Ad, telefon, referans ara..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button type="submit" className="admin-btn admin-btn--gold">Filtrele</button>
      </form>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Yükleniyor...</div>
        ) : bookings.length === 0 ? (
          <div className="admin-empty">Randevu bulunamadı</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Referans</th>
                <th>Müşteri</th>
                <th>Telefon</th>
                <th>Tarih / Saat</th>
                <th>Güzergah</th>
                <th>Araç</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="clickable"
                  onClick={() => navigate("booking-detail", b.id)}
                >
                  <td>{b.reference}</td>
                  <td>{customerName(b)}</td>
                  <td>{b.phone}</td>
                  <td>{formatDateTime(b.pickupAt)}</td>
                  <td>
                    {b.fromLabel}
                    {b.toLabel ? ` → ${b.toLabel}` : b.durationHours ? ` (${b.durationHours}sa)` : ""}
                  </td>
                  <td>{b.vehicle || "—"}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${b.status}`}>
                      {statusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
