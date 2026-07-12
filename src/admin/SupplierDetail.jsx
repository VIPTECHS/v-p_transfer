import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import {
  fetchSupplier, updateSupplier,
  createSupplierBankAccount, deleteSupplierBankAccount,
  uploadSupplierDocument, deleteSupplierDocument,
} from "../api/admin";
import LocationCascadeSelect from "./components/LocationCascadeSelect";
import BankAccountsSection from "./components/BankAccountsSection";
import DocumentsSection from "./components/DocumentsSection";
import LedgerStatement from "./components/LedgerStatement";

const TABS = [
  { id: "company", label: "Firma Bilgileri" },
  { id: "contact", label: "İrtibat" },
  { id: "invoice", label: "Fatura" },
  { id: "bank", label: "Banka" },
  { id: "documents", label: "Belgeler" },
  { id: "ledger", label: "Cari Hesap" },
];

export default function SupplierDetail({ id, onBack }) {
  const [tab, setTab] = useState("company");
  const [supplier, setSupplier] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => fetchSupplier(id).then((s) => { setSupplier(s); setForm(s); });

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await updateSupplier(id, form);
      await load();
    } catch {
      alert("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (!supplier) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <>
      <div className="admin-detail-header">
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onBack}><ArrowLeft size={14} /> Geri</button>
        <h1>{supplier.name}</h1>
        {tab !== "bank" && tab !== "documents" && tab !== "ledger" && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            <Save size={14} /> Kaydet
          </button>
        )}
      </div>

      <div className="settings-tabs">
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
          accounts={supplier.bankAccounts || []}
          onCreate={async (data) => { await createSupplierBankAccount(id, data); await load(); }}
          onDelete={async (accountId) => { await deleteSupplierBankAccount(id, accountId); await load(); }}
        />
      )}

      {tab === "documents" && (
        <DocumentsSection
          documents={supplier.documents || []}
          onUpload={async (fd) => { await uploadSupplierDocument(id, fd); await load(); }}
          onDelete={async (docId) => { await deleteSupplierDocument(id, docId); await load(); }}
        />
      )}

      {tab === "ledger" && <LedgerStatement entityType="supplier" entityId={id} />}
    </>
  );
}
