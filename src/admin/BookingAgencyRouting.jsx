import { useEffect, useState } from "react";
import { clearAgencyRoute, fetchAgencies, routeBookingToAgency } from "../api/admin";
import { agencyResponseBadgeClass, agencyResponseLabel } from "./agencyRouting";
import { formatDateTime } from "./utils";

export default function BookingAgencyRouting({ booking, onUpdated }) {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking.cityId) {
      fetchAgencies({ cityId: booking.cityId }).then(setAgencies);
    } else {
      fetchAgencies().then(setAgencies);
    }
  }, [booking.cityId]);

  const responseStatus = booking.agencyResponseStatus || (booking.routedAgencyId ? "pending" : "open");

  const handleRoute = async () => {
    if (!selectedAgencyId) return;
    setSaving(true);
    setError("");
    try {
      const updated = await routeBookingToAgency(booking.id, selectedAgencyId);
      onUpdated(updated);
      setSelectedAgencyId("");
    } catch {
      setError("Yönlendirme başarısız oldu");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Yönlendirmeyi kaldırıp ilanı şehir havuzuna açmak istiyor musunuz?")) return;
    setSaving(true);
    setError("");
    try {
      const updated = await clearAgencyRoute(booking.id);
      onUpdated(updated);
    } catch {
      setError("İşlem başarısız oldu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-detail-section agency-routing-panel">
      <h3>Acenta Yönlendirme</h3>

      <div className="agency-routing-status">
        <div className="agency-routing-status-row">
          <span className="agency-routing-label">Şehir</span>
          <span>{booking.city?.name || "—"}{booking.city?.country ? ` (${booking.city.country.name})` : ""}</span>
        </div>
        <div className="agency-routing-status-row">
          <span className="agency-routing-label">Yönlendirilen acenta</span>
          <span>{booking.routedAgency?.name || "Şehir havuzu (tüm acentalar)"}</span>
        </div>
        <div className="agency-routing-status-row">
          <span className="agency-routing-label">Acenta cevabı</span>
          <span className={`admin-badge ${agencyResponseBadgeClass(responseStatus)}`}>
            {agencyResponseLabel(responseStatus)}
          </span>
        </div>
        {booking.agency && (
          <div className="agency-routing-status-row">
            <span className="agency-routing-label">Kabul eden</span>
            <span className="admin-badge admin-badge--confirmed">{booking.agency.name}</span>
          </div>
        )}
        {booking.routedAt && (
          <div className="agency-routing-status-row">
            <span className="agency-routing-label">Yönlendirme tarihi</span>
            <span>{formatDateTime(booking.routedAt)}</span>
          </div>
        )}
        {booking.agencyRespondedAt && (
          <div className="agency-routing-status-row">
            <span className="agency-routing-label">Cevap tarihi</span>
            <span>{formatDateTime(booking.agencyRespondedAt)}</span>
          </div>
        )}
        {booking.agencyDeclineNote && (
          <div className="agency-routing-decline-note">
            <strong>Red nedeni:</strong> {booking.agencyDeclineNote}
          </div>
        )}
      </div>

      {error && <div className="admin-error" style={{ marginTop: 12 }}>{error}</div>}

      <div className="agency-routing-actions">
        <select
          value={selectedAgencyId}
          onChange={(e) => setSelectedAgencyId(e.target.value)}
          disabled={saving || !agencies.length}
        >
          <option value="">Acenta seçin...</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn admin-btn--gold"
          disabled={saving || !selectedAgencyId}
          onClick={handleRoute}
        >
          {saving ? "Yönlendiriliyor..." : "Acentaya Yönlendir"}
        </button>
        {booking.routedAgencyId && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={saving}
            onClick={handleClear}
          >
            Havuza Aç
          </button>
        )}
      </div>
      <p className="agency-routing-hint">
        Belirli acentaya yönlendirildiğinde yalnızca o acenta ilanı görür. Havuzda tüm şehir acentaları görebilir.
      </p>
    </div>
  );
}
