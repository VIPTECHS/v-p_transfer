import { useEffect, useState } from "react";
import { fetchStats } from "../api/admin";
import { customerName, formatDateTime, statusLabel } from "./utils";

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setError("İstatistikler yüklenemedi. API sunucusu çalışıyor mu?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <>
      <h1 className="admin-page-title">Panel</h1>
      {error && <div className="admin-error">{error}</div>}

      {stats && (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <strong>{stats.today}</strong>
              <span>Bugün</span>
            </div>
            <div className="admin-stat-card">
              <strong>{stats.pending}</strong>
              <span>Bekleyen</span>
            </div>
            <div className="admin-stat-card">
              <strong>{stats.upcoming}</strong>
              <span>Yaklaşan</span>
            </div>
            <div className="admin-stat-card">
              <strong>{stats.thisMonth}</strong>
              <span>Bu ay</span>
            </div>
            <div className="admin-stat-card">
              <strong>{stats.newEnquiries}</strong>
              <span>Yeni talep</span>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Son randevular</h2>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("bookings")}>
                Tümünü gör
              </button>
            </div>
            {stats.recentBookings?.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Referans</th>
                    <th>Müşteri</th>
                    <th>Tarih</th>
                    <th>Güzergah</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="clickable"
                      onClick={() => navigate("booking-detail", b.id)}
                    >
                      <td>{b.reference}</td>
                      <td>{customerName(b)}</td>
                      <td>{formatDateTime(b.pickupAt)}</td>
                      <td>
                        {b.fromLabel}
                        {b.toLabel ? ` → ${b.toLabel}` : b.durationHours ? ` (${b.durationHours}sa)` : ""}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${b.status}`}>
                          {statusLabel(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty">Henüz randevu yok</div>
            )}
          </div>
        </>
      )}
    </>
  );
}
