import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { deleteBooking, fetchBooking, fetchDrivers, fetchVehicles, updateBooking } from "../api/admin";
import { customerName, formatDateTime, statusLabel } from "./utils";
import { WHATSAPP_URL } from "../data/content";

const BookingMap = lazy(() => import("./BookingMap"));

const STATUSES = [
  { value: "pending", label: "Bekliyor" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "assigned", label: "Atandı" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
];

function waLink(phone, message) {
  const clean = (phone || "").replace(/\D/g, "") || WHATSAPP_URL.replace("https://wa.me/", "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>{booking.reference}</h1>
        <span className={`admin-badge admin-badge--${booking.status}`}>{statusLabel(booking.status)}</span>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-detail-grid">
        <div className="admin-detail-section">
          <h3>Müşteri</h3>
          <Row label="Ad Soyad" value={customerName(booking)} />
          <Row label="E-posta" value={booking.email} />
          <Row label="Telefon" value={booking.phone} />
          <Row label="Yolcu" value={booking.passengers} />
          <Row label="Bagaj" value={booking.luggage} />
          <Row label="Çocuk koltuğu" value={booking.childSeat} />
        </div>

        <div className="admin-detail-section">
          <h3>Yolculuk</h3>
          <Row label="Tür" value={booking.type === "hourly" ? "Saatlik" : "Transfer"} />
          <Row label="Tarih / Saat" value={formatDateTime(booking.pickupAt)} />
          <Row label="Nereden" value={booking.fromLabel} />
          {booking.toLabel && <Row label="Nereye" value={booking.toLabel} />}
          {booking.durationHours && <Row label="Süre" value={`${booking.durationHours} saat`} />}
          {booking.flightNumber && <Row label="Uçuş" value={booking.flightNumber} />}
          {booking.meetAndGreetName && <Row label="Karşılama" value={booking.meetAndGreetName} />}
          {booking.returnTransfer && <Row label="Dönüş" value="Evet" />}
          <Row label="Araç tipi" value={booking.vehicle || "—"} />
          {booking.notes && <Row label="Not" value={booking.notes} />}
        </div>

        <div className="admin-detail-section">
          <h3>Atama</h3>
          <label className="admin-detail-row">
            <span>Şoför</span>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">Seçin</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.phone}</option>
              ))}
            </select>
          </label>
          <label className="admin-detail-row">
            <span>Araç</span>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Seçin</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}{v.plate ? ` (${v.plate})` : ""}</option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-btn admin-btn--gold" onClick={handleAssign} disabled={saving}>
            Atamayı Kaydet
          </button>
        </div>
      </div>

      {hasCoords && (
        <div className="admin-detail-section" style={{ marginTop: 20 }}>
          <h3>Harita</h3>
          <Suspense fallback={<div className="admin-loading">Harita yükleniyor...</div>}>
            <BookingMap booking={booking} />
          </Suspense>
        </div>
      )}

      <div className="admin-detail-section" style={{ marginTop: 20 }}>
        <h3>Mesajlar</h3>
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
              <span>{log.fromStatus ? `${log.fromStatus} → ` : ""}{log.toStatus}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-detail-actions">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`admin-btn ${booking.status === s.value ? "admin-btn--gold" : "admin-btn--ghost"}`}
            disabled={saving || booking.status === s.value}
            onClick={() => handleStatusChange(s.value)}
          >
            {s.label}
          </button>
        ))}
        <button type="button" className="admin-btn admin-btn--danger" disabled={deleting} onClick={handleDelete} style={{ marginLeft: "auto" }}>
          {deleting ? "Siliniyor..." : "Sil"}
        </button>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="admin-detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
