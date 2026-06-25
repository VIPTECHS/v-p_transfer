import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { deleteBooking, fetchBooking, fetchDrivers, fetchVehicles, updateBooking } from "../api/admin";
import { customerName, formatDateTime, statusLabel } from "./utils";
import { WHATSAPP_URL } from "../data/content";
import AgencyBookingFleetCard from "./AgencyBookingFleetCard";
import BookingStatusPanel from "./BookingStatusPanel";
import BookingAgencyRouting from "./BookingAgencyRouting";
import { BookingDetailHeader, DetailRow, RouteCard, statusLabelTr } from "./bookingDetailShared";

const BookingMap = lazy(() => import("./BookingMap"));

function waLink(phone, message) {
  const clean = (phone || "").replace(/\D/g, "") || WHATSAPP_URL.replace("https://wa.me/", "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function BookingMapSection({ booking, hasCoords }) {
  return (
    <div className="admin-detail-section booking-map-section">
      <h3>Rota Haritası</h3>
      {hasCoords ? (
        <Suspense fallback={<div className="admin-loading booking-map-loading">Harita yükleniyor...</div>}>
          <BookingMap booking={booking} />
        </Suspense>
      ) : (
        <div className="booking-map-empty">
          <span className="booking-map-empty-icon" aria-hidden>📍</span>
          <p>Bu rezervasyon için konum bilgisi kaydedilmemiş.</p>
        </div>
      )}
    </div>
  );
}

export default function BookingDetail({ id, onBack }) {
  const [booking, setBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const load = () => {
    Promise.all([fetchBooking(id), fetchDrivers(), fetchVehicles()])
      .then(([b, d, v]) => {
        setBooking(b);
        setDrivers(d.filter((x) => x.isActive));
        setVehicles(v.filter((x) => x.isActive));
        setDriverId(b.assignedDriverId || "");
        setVehicleId(b.assignedVehicleId || "");
      })
      .catch(() => setError("Randevu bulunamadı"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (status) => {
    setSaving(true);
    try {
      const updated = await updateBooking(id, { status });
      setBooking(updated);
    } catch {
      setError("Durum güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
    await handleStatusChange("cancelled");
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      const updated = await updateBooking(id, {
        assignedDriverId: driverId || null,
        assignedVehicleId: vehicleId || null,
        status: driverId ? "assigned" : booking.status,
      });
      setBooking(updated);
    } catch {
      setError("Atama başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    setDeleting(true);
    try {
      await deleteBooking(id);
      onBack();
    } catch {
      setError("Silme işlemi başarısız");
      setDeleting(false);
    }
  };

  const hasCoords = useMemo(
    () => booking?.fromLat != null && booking?.fromLng != null,
    [booking],
  );

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;
  if (!booking) return <div className="admin-error">{error || "Randevu bulunamadı"}</div>;

  const customerMsg = (template) => {
    const name = customerName(booking);
    const templates = {
      received: `Merhaba ${name}, ${booking.reference} rezervasyonunuz alındı. ${formatDateTime(booking.pickupAt)} — ${booking.fromLabel}${booking.toLabel ? ` → ${booking.toLabel}` : ""}`,
      driver: `Merhaba ${name}, ${booking.reference} transferiniz için şoförünüz: ${booking.assignedDriver?.name || "atanacak"}. Tel: ${booking.assignedDriver?.phone || ""}`,
      approaching: `Merhaba ${name}, şoförünüz ${booking.reference} transferi için yola çıktı. Lütfen hazır olun.`,
      thanks: `Teşekkürler ${name}! ${booking.reference} transferinizi tercih ettiğiniz için minnettarız. Geri bildiriminizi bekleriz.`,
    };
    return templates[template];
  };

  return (
    <>
      <button type="button" className="admin-back" onClick={onBack}>← Randevulara dön</button>

      <BookingDetailHeader
        reference={booking.reference}
        title={customerName(booking)}
        badges={
          <>
            <span className={`admin-badge admin-badge--${booking.status}`}>
              {statusLabelTr(booking.status)}
            </span>
            <span className="admin-badge admin-badge--pending">
              {booking.type === "hourly" ? "Saatlik" : "Transfer"}
            </span>
            {booking.returnTransfer && (
              <span className="admin-badge admin-badge--confirmed">Dönüş</span>
            )}
          </>
        }
      />

      {error && <div className="admin-error">{error}</div>}

      <BookingStatusPanel
        status={booking.status}
        saving={saving}
        hasDriver={Boolean(booking.assignedDriverId || driverId)}
        onStatusChange={handleStatusChange}
        onCancel={handleCancel}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <BookingAgencyRouting booking={booking} onUpdated={setBooking} />

      <div className="booking-route-map-row">
        <RouteCard
          from={booking.fromLabel}
          to={booking.toLabel}
          pickupAt={booking.pickupAt}
          type={booking.type}
          durationHours={booking.durationHours}
        />
        <BookingMapSection booking={booking} hasCoords={hasCoords} />
      </div>

      <div className="admin-detail-grid agency-detail-grid">
        <AgencyBookingFleetCard booking={booking} />

        <div className="admin-detail-section">
          <h3>Müşteri Bilgileri</h3>
          <DetailRow label="E-posta" value={booking.email} />
          <DetailRow label="Telefon" value={booking.phone} />
          <DetailRow label="Çocuk koltuğu" value={booking.childSeat} />
          {booking.flightNumber && <DetailRow label="Uçuş" value={booking.flightNumber} />}
          {booking.meetAndGreetName && <DetailRow label="Karşılama" value={booking.meetAndGreetName} />}
          {booking.notes && <DetailRow label="Not" value={booking.notes} />}
        </div>

        <div className="admin-detail-section">
          <h3>Şoför & Araç Atama</h3>
          <label className="admin-detail-row admin-detail-row--field">
            <span>Şoför</span>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">Seçin</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.phone}</option>
              ))}
            </select>
          </label>
          <label className="admin-detail-row admin-detail-row--field">
            <span>Filo aracı</span>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Seçin</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}{v.plate ? ` (${v.plate})` : ""}</option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-btn admin-btn--gold" onClick={handleAssign} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Atamayı Kaydet"}
          </button>
        </div>
      </div>

      <div className="admin-detail-section" style={{ marginTop: 20 }}>
        <h3>WhatsApp Mesajları</h3>
        <div className="admin-detail-actions">
          <a className="admin-btn admin-btn--ghost" href={waLink(booking.phone, customerMsg("received"))} target="_blank" rel="noopener noreferrer">Rezervasyon alındı</a>
          <a className="admin-btn admin-btn--ghost" href={waLink(booking.phone, customerMsg("driver"))} target="_blank" rel="noopener noreferrer">Şoför bilgisi</a>
          <a className="admin-btn admin-btn--ghost" href={waLink(booking.phone, customerMsg("approaching"))} target="_blank" rel="noopener noreferrer">Araç yolda</a>
          <a className="admin-btn admin-btn--ghost" href={waLink(booking.phone, customerMsg("thanks"))} target="_blank" rel="noopener noreferrer">Teşekkür</a>
        </div>
      </div>

      {booking.statusLogs?.length > 0 && (
        <div className="admin-detail-section" style={{ marginTop: 20 }}>
          <h3>Durum Geçmişi</h3>
          {booking.statusLogs.map((log) => (
            <div key={log.id} className="admin-detail-row">
              <span>{formatDateTime(log.createdAt)}</span>
              <span>{log.fromStatus ? `${statusLabel(log.fromStatus)} → ` : ""}{statusLabel(log.toStatus)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
