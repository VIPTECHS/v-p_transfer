import { useEffect, useState } from "react";
import { Plane, MapPin, ArrowRight, Pencil, Trash2, Plus, Minus, Copy, Printer, Save } from "lucide-react";
import {
  fetchReservation, updateReservation, deleteReservation,
  addTransfer, updateTransfer, deleteTransfer,
  addPassenger, deletePassenger,
  fetchCustomers, fetchSuppliers, fetchVehicles,
} from "../api/admin";
import StatusBadge from "./components/StatusBadge";
import PaymentBadge from "./components/PaymentBadge";
import CurrencyInput from "./components/CurrencyInput";
import SearchableSelect from "./components/SearchableSelect";

const TRANSFER_TYPES = [
  { value: "arrival", label: "Varış Transferi" },
  { value: "departure", label: "Dönüş Transferi" },
  { value: "internal", label: "İç Transfer" },
];

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Ödenmedi" },
  { value: "paid", label: "Ödendi" },
  { value: "partial", label: "Kısmi" },
];

const PAYMENT_TYPES = ["Nakit", "Banka Transferi", "Kredi Kartı", "Havale"];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR");
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function maskIdentity(id) {
  if (!id || id.length < 4) return id || "";
  return "*".repeat(id.length - 3) + id.slice(-3);
}

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

export default function ReservationDetail({ id, onBack }) {
  const [reservation, setReservation] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editable state
  const [form, setForm] = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([fetchReservation(id), fetchCustomers(), fetchSuppliers(), fetchVehicles()])
      .then(([r, c, s, v]) => {
        setReservation(r);
        setCustomers(c);
        setSuppliers(s);
        setVehicles(v.filter((x) => x.isActive));
        setForm({
          status: r.status,
          supplierId: r.supplierId,
          supplierPrice: r.supplierPrice,
          supplierCurrency: r.supplierCurrency,
          supplierPaymentStatus: r.supplierPaymentStatus,
          supplierPaymentType: r.supplierPaymentType,
          supplierNote: r.supplierNote,
          customerId: r.customerId,
          salePrice: r.salePrice,
          saleCurrency: r.saleCurrency,
          customerPaymentStatus: r.customerPaymentStatus,
          customerPaymentType: r.customerPaymentType,
          customerPaymentDate: toDateInput(r.customerPaymentDate),
          customerNote: r.customerNote,
          assignedVehicleId: r.assignedVehicleId,
        });
      })
      .catch(() => setError("Rezervasyon bulunamadı"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateReservation(id, {
        ...form,
        customerPaymentDate: form.customerPaymentDate || null,
      });
      setReservation(updated);
    } catch {
      setError("Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteReservation(id);
      onBack();
    } catch {
      setError("Silme başarısız");
    }
  };

  const handleAddTransfer = async () => {
    try {
      const updated = await addTransfer(id, {
        fromLabel: "",
        toLabel: "",
        transferDate: new Date().toISOString(),
        type: "arrival",
      });
      setReservation(updated);
    } catch {
      setError("Transfer eklenemedi");
    }
  };

  const handleDeleteTransfer = async (transferId) => {
    try {
      const updated = await deleteTransfer(id, transferId);
      setReservation(updated);
    } catch {
      setError("Transfer silinemedi");
    }
  };

  const handleTransferChange = async (transferId, field, value) => {
    try {
      const updated = await updateTransfer(id, transferId, { [field]: value });
      setReservation(updated);
    } catch {
      setError("Transfer güncellenemedi");
    }
  };

  const handleAddPassenger = async () => {
    try {
      const updated = await addPassenger(id, { firstName: "", lastName: "" });
      setReservation(updated);
    } catch {
      setError("Yolcu eklenemedi");
    }
  };

  const handleDeletePassenger = async (passengerId) => {
    try {
      const updated = await deletePassenger(id, passengerId);
      setReservation(updated);
    } catch {
      setError("Yolcu silinemedi");
    }
  };

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;
  if (!reservation) return <div className="admin-error">{error || "Rezervasyon bulunamadı"}</div>;

  const profit = (form.salePrice || 0) - (form.supplierPrice || 0);
  const margin = form.salePrice > 0 ? Math.round((profit / form.salePrice) * 100) : 0;
  const firstTransfer = reservation.transfers?.[0];
  const customerDisplay = customers.find((c) => c.id === form.customerId);
  const supplierDisplay = suppliers.find((s) => s.id === form.supplierId);

  return (
    <>
      {/* Header */}
      <div className="reservation-header">
        <div className="reservation-header-left">
          <button type="button" className="admin-back" onClick={onBack}>←</button>
          <h1>Rezervasyon Detayı <span className="reservation-header-ref">#{reservation.reference}</span></h1>
        </div>
        <div className="reservation-header-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigator.clipboard?.writeText(reservation.reference)}>
            <Copy size={14} /> Kopyala
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => window.print()}>
            <Printer size={14} /> Yazdır
          </button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete}>
            <Trash2 size={14} /> Sil
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Info Card */}
      <div className="reservation-info-card">
        <div>
          <p className="reservation-info-ref">Rezervasyon No</p>
          <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 8px" }}>
            #{reservation.reference}
            <span style={{ marginLeft: 12 }}><StatusBadge status={form.status} /></span>
          </p>
          <div style={{ marginBottom: 8 }}>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ background: "#f9fafb", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}
            >
              <option value="pending">Bekliyor</option>
              <option value="confirmed">Onaylandı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
          <p className="reservation-info-dates">
            Oluşturma Tarihi<br />{formatDateTime(reservation.createdAt)}<br />
            Güncelleme Tarihi<br />{formatDateTime(reservation.updatedAt)}
          </p>
        </div>
        <div>
          <div className="reservation-info-label">Nereden</div>
          <p className="reservation-info-location">
            <Plane size={16} style={{ color: "#3b82f6" }} />
            {firstTransfer?.fromLabel || "—"}
            {firstTransfer?.flightCode && (
              <span className="reservation-info-flight">{firstTransfer.flightCode}</span>
            )}
          </p>
          <div className="reservation-info-label" style={{ marginTop: 12 }}>Nereye</div>
          <p className="reservation-info-location">
            <MapPin size={16} style={{ color: "#dc2626" }} />
            {firstTransfer?.toLabel || "—"}
          </p>
        </div>
        <div>
          <div className="reservation-price-row">
            <span className="reservation-price-label">Tedarikçi Fiyatı (Toplam)</span>
          </div>
          <div className="reservation-price-value" style={{ color: "#dc2626" }}>
            {form.supplierCurrency === "EUR" ? "€" : form.supplierCurrency} {(form.supplierPrice || 0).toFixed(2).replace(".", ",")}
          </div>
          <div className="reservation-price-row" style={{ marginTop: 8 }}>
            <span className="reservation-price-label">Satış Fiyatı (Toplam)</span>
          </div>
          <div className="reservation-price-value">
            {form.saleCurrency === "EUR" ? "€" : form.saleCurrency} {(form.salePrice || 0).toFixed(2).replace(".", ",")}
          </div>
          <div style={{ marginTop: 8 }}>
            <span className="reservation-price-label">Kâr</span>
            <div className="reservation-price-value reservation-price-value--profit">
              {form.saleCurrency === "EUR" ? "€" : form.saleCurrency} {profit.toFixed(2).replace(".", ",")}
              {margin > 0 && <span className="reservation-profit-badge">%{margin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Transfers */}
      <div className="reservation-transfers">
        <div className="reservation-transfers-header">
          <div>
            <h2>Transferler</h2>
            <p>Bu rezervasyona ait transfer (varış – dönüş – iç transfer vb.) bilgilerini buradan yönetebilirsiniz.</p>
          </div>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleAddTransfer}>
            <Plus size={14} /> Transfer Ekle
          </button>
        </div>

        <table className="transfers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Sefer Kodu</th>
              <th>Nereden</th>
              <th></th>
              <th>Nereye</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Tip</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservation.transfers?.map((t, i) => (
              <tr key={t.id}>
                <td>
                  <span className={`transfer-num transfer-num--${i < 3 ? i + 1 : "default"}`}>{i + 1}</span>
                </td>
                <td>
                  <span className="transfer-flight-code">
                    {t.flightCode || "–"}
                    <button
                      type="button"
                      className="transfer-flight-edit"
                      onClick={() => {
                        const code = window.prompt("Sefer kodu:", t.flightCode || "");
                        if (code !== null) handleTransferChange(t.id, "flightCode", code || null);
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                  </span>
                </td>
                <td>
                  <span className="transfer-location">
                    {t.type === "arrival" ? <Plane size={14} className="transfer-location-icon" /> : <MapPin size={14} className="transfer-location-icon" />}
                    {t.fromLabel || "—"}
                  </span>
                </td>
                <td><ArrowRight size={14} className="transfer-arrow" /></td>
                <td>
                  <span className="transfer-location">
                    <MapPin size={14} className="transfer-location-icon" />
                    {t.toLabel || "—"}
                  </span>
                </td>
                <td>{formatDate(t.transferDate)}</td>
                <td>{t.transferTime || "—"}</td>
                <td>
                  <select
                    className="transfer-type-select"
                    value={t.type}
                    onChange={(e) => handleTransferChange(t.id, "type", e.target.value)}
                  >
                    {TRANSFER_TYPES.map((tt) => (
                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="transfer-actions">
                    <button type="button" className="transfer-action-btn transfer-action-btn--delete" onClick={() => handleDeleteTransfer(t.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!reservation.transfers || reservation.transfers.length === 0) && (
          <div className="admin-empty">Henüz transfer eklenmemiş</div>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleAddTransfer} style={{ fontSize: 12 }}>
            <Plus size={12} /> Transfer Ekle
          </button>
        </div>
      </div>

      {/* Three Column Detail */}
      <div className="reservation-detail-three-col">
        {/* Passengers */}
        <div className="admin-detail-section reservation-passengers">
          <h3>
            Yolcu Bilgileri
            <span className="passenger-count">
              Toplam Yolcu
              <button type="button" className="passenger-count-btn" onClick={() => handleDeletePassenger(reservation.passengers?.[reservation.passengers.length - 1]?.id)} disabled={!reservation.passengers?.length}>
                <Minus size={12} />
              </button>
              <strong>{reservation.passengers?.length || 0}</strong> Kişi
              <button type="button" className="passenger-count-btn" onClick={handleAddPassenger}>
                <Plus size={12} />
              </button>
            </span>
          </h3>

          {reservation.passengers?.map((p, i) => (
            <div key={p.id} className="passenger-row">
              <span className="passenger-num">{i + 1}</span>
              <div>
                <div className="passenger-field-label">Ad</div>
                <div className="passenger-field-value">{p.firstName || "—"}</div>
              </div>
              <div>
                <div className="passenger-field-label">Soyad</div>
                <div className="passenger-field-value">{p.lastName || "—"}</div>
              </div>
              <div>
                <div className="passenger-field-label">TCKN / Pasaport</div>
                <div className="passenger-field-value">{maskIdentity(p.identityNumber)}</div>
              </div>
              <button type="button" className="passenger-delete" onClick={() => handleDeletePassenger(p.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <button type="button" className="admin-btn admin-btn--primary" style={{ fontSize: 12 }} onClick={handleAddPassenger}>
              <Plus size={12} /> Yolcu Ekle
            </button>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="admin-detail-section">
          <h3>Tedarikçi Bilgileri</h3>
          <div className="detail-field">
            <label>Tedarikçi</label>
            <SearchableSelect
              options={suppliers.map((s) => ({ id: s.id, name: s.name }))}
              value={form.supplierId}
              onChange={(v) => setForm({ ...form, supplierId: v })}
              placeholder="Tedarikçi seçin"
            />
          </div>
          <div className="detail-field">
            <label>Araç</label>
            <SearchableSelect
              options={vehicles.map((v) => ({ id: v.id, name: `${v.name}${v.plate ? ` - ${v.plate}` : ""}` }))}
              value={form.assignedVehicleId}
              onChange={(v) => setForm({ ...form, assignedVehicleId: v })}
              placeholder="Araç seçin"
            />
          </div>
          <div className="detail-field">
            <label>Tedarikçi Fiyatı</label>
            <CurrencyInput
              value={form.supplierPrice}
              currency={form.supplierCurrency}
              onValueChange={(v) => setForm({ ...form, supplierPrice: v })}
              onCurrencyChange={(v) => setForm({ ...form, supplierCurrency: v })}
            />
          </div>
          <div className="detail-field">
            <label>Ödeme Durumu</label>
            <select
              value={form.supplierPaymentStatus || "unpaid"}
              onChange={(e) => setForm({ ...form, supplierPaymentStatus: e.target.value })}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="detail-field">
            <label>Ödeme Tipi</label>
            <select
              value={form.supplierPaymentType || ""}
              onChange={(e) => setForm({ ...form, supplierPaymentType: e.target.value })}
            >
              <option value="">Seçin</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="detail-field">
            <label>Not</label>
            <textarea
              value={form.supplierNote || ""}
              onChange={(e) => setForm({ ...form, supplierNote: e.target.value })}
              placeholder="Tedarikçi notu..."
            />
          </div>
        </div>

        {/* Customer / Payment Info */}
        <div className="admin-detail-section">
          <h3>Müşteri / Ödeme Bilgileri</h3>
          <div className="detail-field">
            <label>Müşteri</label>
            <SearchableSelect
              options={customers.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName || ""}`.trim() }))}
              value={form.customerId}
              onChange={(v) => setForm({ ...form, customerId: v })}
              placeholder="Müşteri seçin"
            />
          </div>
          <div className="detail-field">
            <label>Satış Fiyatı</label>
            <CurrencyInput
              value={form.salePrice}
              currency={form.saleCurrency}
              onValueChange={(v) => setForm({ ...form, salePrice: v })}
              onCurrencyChange={(v) => setForm({ ...form, saleCurrency: v })}
            />
          </div>
          <div className="detail-field">
            <label>Ödeme Tipi</label>
            <select
              value={form.customerPaymentType || ""}
              onChange={(e) => setForm({ ...form, customerPaymentType: e.target.value })}
            >
              <option value="">Seçin</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="detail-field">
            <label>Ödeme Durumu</label>
            <PaymentBadge status={form.customerPaymentStatus} />
            <select
              value={form.customerPaymentStatus || "unpaid"}
              onChange={(e) => setForm({ ...form, customerPaymentStatus: e.target.value })}
              style={{ marginTop: 6 }}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="detail-field">
            <label>Ödeme Tarihi</label>
            <input
              type="date"
              value={form.customerPaymentDate || ""}
              onChange={(e) => setForm({ ...form, customerPaymentDate: e.target.value })}
            />
          </div>
          <div className="detail-field">
            <label>Not</label>
            <textarea
              value={form.customerNote || ""}
              onChange={(e) => setForm({ ...form, customerNote: e.target.value })}
              placeholder="Müşteri notu..."
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="reservation-summary">
        <h3>Özet</h3>
        <div className="summary-row">
          <div className="summary-route">
            <Plane size={16} className="summary-route-icon" />
            <span>{firstTransfer?.fromLabel || "—"}</span>
            <ArrowRight size={14} style={{ color: "#9ca3af" }} />
            <MapPin size={16} className="summary-route-dot" />
            <span>{firstTransfer?.toLabel || "—"}</span>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{reservation.transfers?.length || 0}</div>
            <div className="summary-stat-label">Transfer Sayısı</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{reservation.passengers?.length || 0}</div>
            <div className="summary-stat-label">Yolcu Sayısı</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value" style={{ color: "#dc2626" }}>
              € {(form.supplierPrice || 0).toFixed(2).replace(".", ",")}
            </div>
            <div className="summary-stat-label">Tedarikçi Fiyatı (Toplam)</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">
              € {(form.salePrice || 0).toFixed(2).replace(".", ",")}
            </div>
            <div className="summary-stat-label">Satış Fiyatı (Toplam)</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value summary-stat-value--green">
              € {profit.toFixed(2).replace(".", ",")}
            </div>
            <div className="summary-stat-label">Kâr {margin > 0 && <span style={{ color: "#16a34a" }}>%{margin}</span>}</div>
          </div>
        </div>
      </div>
    </>
  );
}
