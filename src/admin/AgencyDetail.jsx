import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import {
  fetchAgency, updateAgency, resetAgencyPassword, fetchAgencyReservations,
  createAgencyBankAccount, deleteAgencyBankAccount,
  uploadAgencyDocument, deleteAgencyDocument,
} from "../api/admin";
import LocationCascadeSelect from "./components/LocationCascadeSelect";
import BankAccountsSection from "./components/BankAccountsSection";
import DocumentsSection from "./components/DocumentsSection";
import LedgerStatement from "./components/LedgerStatement";
import StatusBadge from "./components/StatusBadge";

const TABS = [
  { id: "company", label: "Firma Bilgileri" },
  { id: "contact", label: "İrtibat" },
  { id: "invoice", label: "Fatura" },
  { id: "bank", label: "Banka" },
  { id: "documents", label: "Belgeler" },
  { id: "commission", label: "Komisyon" },
  { id: "reservations", label: "Rezervasyon Geçmişi" },
  { id: "ledger", label: "Cari Hesap" },
  { id: "login", label: "Giriş Bilgileri" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR");
}

export default function AgencyDetail({ id, onBack, navigate }) {
  const [tab, setTab] = useState("company");
  const [agency, setAgency] = useState(null);
  const [form, setForm] = useState({});
  const [reservations, setReservations] = useState([]);
  const [newPass, setNewPass] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => fetchAgency(id).then((a) => { setAgency(a); setForm(a); });

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (tab === "reservations") fetchAgencyReservations(id).then(setReservations).catch(() => {});
  }, [tab, id]);

  const save = async () => {
    setSaving(true);
    try {
      await updateAgency(id, form);
      await load();
    } catch {
      alert("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (!agency) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <>
      <div className="admin-detail-header">
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onBack}><ArrowLeft size={14} /> Geri</button>
        <h1>{agency.name}</h1>
        {!["bank", "documents", "ledger", "reservations", "login"].includes(tab) && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            <Save size={14} /> Kaydet
          </button>
        )}
      </div>

      <div className="settings-tabs" style={{ flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`settings-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "company" && (
        <div className="admin-card admin-form-grid">
          <div className="detail-field"><label>Firma Adı *</label><input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <LocationCascadeSelect
            countryId={form.countryId}
            cityId={form.cityId}
            districtId={form.districtId}
            onCountryChange={(v) => setForm({ ...form, countryId: v, cityId: null, districtId: null })}
            onCityChange={(v) => setForm({ ...form, cityId: v, districtId: null })}
            onDistrictChange={(v) => setForm({ ...form, districtId: v })}
            required
          />
          <div className="detail-field"><label>Açık Adres</label><textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="detail-field"><label>Telefon</label><input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="detail-field"><label>WhatsApp</label><input value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
          <div className="detail-field"><label>E-posta</label><input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="detail-field"><label>Web Sitesi</label><input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div className="detail-field">
            <label>Durum</label>
            <select value={form.isActive ? "1" : "0"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}>
              <option value="1">Aktif</option><option value="0">Pasif</option>
            </select>
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div className="admin-card admin-form-grid">
          <div className="detail-field"><label>İrtibat Kişisi</label><input value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
          <div className="detail-field"><label>Telefon</label><input value={form.contactPhone || ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></div>
          <div className="detail-field"><label>WhatsApp</label><input value={form.contactWhatsapp || ""} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} /></div>
          <div className="detail-field"><label>E-posta</label><input type="email" value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
        </div>
      )}

      {tab === "invoice" && (
        <div className="admin-card admin-form-grid">
          <div className="detail-field"><label>Ticari Unvan</label><input value={form.invoiceTitle || ""} onChange={(e) => setForm({ ...form, invoiceTitle: e.target.value })} /></div>
          <div className="detail-field"><label>Vergi Dairesi</label><input value={form.taxOffice || ""} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} /></div>
          <div className="detail-field"><label>Vergi Numarası</label><input value={form.taxNumber || ""} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} /></div>
          <div className="detail-field"><label>Fatura Adresi</label><textarea value={form.invoiceAddress || ""} onChange={(e) => setForm({ ...form, invoiceAddress: e.target.value })} /></div>
          <div className="detail-field"><label>Fatura E-posta</label><input type="email" value={form.invoiceEmail || ""} onChange={(e) => setForm({ ...form, invoiceEmail: e.target.value })} /></div>
        </div>
      )}

      {tab === "bank" && (
        <BankAccountsSection
          accounts={agency.bankAccounts || []}
          onCreate={async (data) => { await createAgencyBankAccount(id, data); await load(); }}
          onDelete={async (accountId) => { await deleteAgencyBankAccount(id, accountId); await load(); }}
        />
      )}

      {tab === "documents" && (
        <DocumentsSection
          documents={agency.documents || []}
          onUpload={async (fd) => { await uploadAgencyDocument(id, fd); await load(); }}
          onDelete={async (docId) => { await deleteAgencyDocument(id, docId); await load(); }}
        />
      )}

      {tab === "commission" && (
        <div className="admin-card admin-form-grid">
          <div className="detail-field">
            <label>Komisyon Tipi</label>
            <select value={form.commissionType || "percentage"} onChange={(e) => setForm({ ...form, commissionType: e.target.value })}>
              <option value="percentage">Yüzde (%)</option>
              <option value="fixed">Sabit Tutar</option>
            </select>
          </div>
          <div className="detail-field"><label>Komisyon Oranı / Tutar</label><input type="number" step="0.01" value={form.commissionRate ?? ""} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} /></div>
          <div className="detail-field"><label>Para Birimi</label><input value={form.commissionCurrency || "EUR"} onChange={(e) => setForm({ ...form, commissionCurrency: e.target.value })} /></div>
        </div>
      )}

      {tab === "reservations" && (
        <div className="admin-card">
          <table className="admin-table">
            <thead><tr><th>Ref</th><th>Müşteri</th><th>Transfer Tarihi</th><th>Satış</th><th>Durum</th></tr></thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate("reservation-detail", r.id)}>
                  <td>#{r.reference}</td>
                  <td>{r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—"}</td>
                  <td>{formatDate(r.firstTransferDate)}</td>
                  <td>{r.salePrice != null ? `${r.saleCurrency} ${r.salePrice}` : "—"}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {reservations.length === 0 && <tr><td colSpan={5} className="admin-empty">Rezervasyon yok</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "ledger" && <LedgerStatement entityType="agency" entityId={id} />}

      {tab === "login" && (
        <div className="admin-card admin-form-grid">
          <div className="detail-field"><label>Kullanıcı Adı</label><input value={agency.username} disabled /></div>
          <div className="detail-field">
            <label>Yeni Şifre</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn--primary" onClick={async () => {
              if (!newPass) return;
              await resetAgencyPassword(id, newPass);
              setNewPass("");
              alert("Şifre güncellendi");
            }}>Şifre Sıfırla</button>
          </div>
        </div>
      )}
    </>
  );
}
