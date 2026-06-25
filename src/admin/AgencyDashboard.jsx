import { useEffect, useState } from "react";
import { acceptAgencyBooking, fetchAgencyStats, getAgencyInfo } from "../api/admin";
import { AgencyAcceptButton } from "./AgencyAcceptPanel";

const STATUS_LABELS = { pending: "Bekleyen", confirmed: "Onaylı", assigned: "Atanmış", completed: "Tamamlandı", cancelled: "İptal" };

export default function AgencyDashboard({ navigate }) {
  const [stats, setStats] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const myAgencyId = getAgencyInfo()?.agencyId;

  const load = () => fetchAgencyStats().then(setStats);
  useEffect(() => { load(); }, []);

  const handleAccept = async (id, e) => {
    e?.stopPropagation();
    setAccepting(id);
    try {
      await acceptAgencyBooking(id);
      load();
    } catch (err) {
      if (err.status === 409) alert("Bu ilan başka bir acenta tarafından kabul edildi.");
      else alert("Kabul işlemi başarısız oldu.");
    } finally {
      setAccepting(null);
    }
  };

  if (!stats) return <p>Yükleniyor...</p>;

  return (
    <>
      <h1 className="admin-page-title">Panel</h1>
      <div className="admin-stats">
        <div className="stat-card"><span className="stat-value">{stats.today}</span><span className="stat-label">Bugün</span></div>
        <div className="stat-card"><span className="stat-value">{stats.pending}</span><span className="stat-label">Bekleyen İlan</span></div>
        <div className="stat-card"><span className="stat-value">{stats.upcoming}</span><span className="stat-label">Yaklaşan</span></div>
        <div className="stat-card"><span className="stat-value">{stats.thisMonth}</span><span className="stat-label">Bu Ay</span></div>
      </div>
      {stats.recentBookings?.length > 0 && (
        <div className="admin-card" style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Son İlanlar</h2>
          {stats.recentBookings.map((b) => (
            <div key={b.id} className="admin-booking-card" style={{ marginBottom: 12 }}>
              <div className="admin-booking-card-header">
                <strong>{b.reference} — {b.firstName} {b.lastName || ""}</strong>
                <span className={`admin-badge admin-badge--${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span>
              </div>
              <div className="admin-booking-card-route">{b.fromLabel} → {b.toLabel || "—"}</div>
              <div className="admin-booking-card-meta">{new Date(b.pickupAt).toLocaleString("tr-TR")}</div>
              <div className="admin-detail-actions" style={{ marginTop: 12 }}>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("booking-detail", b.id)}>Detay</button>
                {b.status === "pending" && !b.agencyId && (
                  <AgencyAcceptButton
                    accepting={accepting === b.id}
                    onAccept={() => handleAccept(b.id)}
                  />
                )}
                {b.agencyId === myAgencyId && <span className="admin-badge admin-badge--confirmed">Sizin</span>}
                {b.agencyId && b.agencyId !== myAgencyId && (
                  <span className="admin-badge admin-badge--cancelled">{b.agency?.name || "Alındı"}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
