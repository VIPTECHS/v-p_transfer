import { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";

export const DOC_TYPES = [
  { value: "d2_authorization", label: "D2 Yetki Belgesi" },
  { value: "tursab", label: "TÜRSAB Belgesi" },
  { value: "tax_plate", label: "Vergi Levhası" },
  { value: "activity", label: "Faaliyet Belgesi" },
  { value: "signature_circular", label: "İmza Sirküleri" },
  { value: "trade_registry", label: "Ticaret Sicil Gazetesi" },
  { value: "other", label: "Diğer Belgeler" },
];

function docTypeLabel(type) {
  return DOC_TYPES.find((d) => d.value === type)?.label || type;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR");
}

function expiryBadge(expiresAt) {
  if (!expiresAt) return null;
  const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="doc-expiry doc-expiry--expired">Süresi doldu</span>;
  if (days <= 30) return <span className="doc-expiry doc-expiry--warning">{days} gün kaldı</span>;
  return null;
}

export default function DocumentsSection({ documents, onUpload, onDelete }) {
  const [form, setForm] = useState({ docType: "tax_plate", docNumber: "", issuedAt: "", expiresAt: "", file: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) return alert("Dosya seçin");
    const fd = new FormData();
    fd.append("file", form.file);
    fd.append("docType", form.docType);
    if (form.docNumber) fd.append("docNumber", form.docNumber);
    if (form.issuedAt) fd.append("issuedAt", form.issuedAt);
    if (form.expiresAt) fd.append("expiresAt", form.expiresAt);
    try {
      await onUpload(fd);
      setForm({ docType: "tax_plate", docNumber: "", issuedAt: "", expiresAt: "", file: null });
    } catch {
      alert("Belge yüklenemedi");
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Belgeler</h3>
      <form onSubmit={handleSubmit} className="admin-form-grid admin-card" style={{ marginBottom: 16 }}>
        <div className="detail-field">
          <label>Belge Tipi</label>
          <select value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
            {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="detail-field"><label>Belge No</label><input value={form.docNumber} onChange={(e) => setForm({ ...form, docNumber: e.target.value })} /></div>
        <div className="detail-field"><label>Düzenlenme</label><input type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} /></div>
        <div className="detail-field"><label>Geçerlilik</label><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
        <div className="detail-field"><label>Dosya (PDF/Görsel)</label><input type="file" accept=".pdf,image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></div>
        <div className="admin-form-actions"><button type="submit" className="admin-btn admin-btn--primary"><Plus size={14} /> Yükle</button></div>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Belge</th><th>No</th><th>Düzenlenme</th><th>Geçerlilik</th><th></th></tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id}>
                <td>
                  <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  {docTypeLabel(d.docType)} {expiryBadge(d.expiresAt)}
                </td>
                <td>{d.docNumber || "—"}</td>
                <td>{formatDate(d.issuedAt)}</td>
                <td>{formatDate(d.expiresAt)}</td>
                <td>
                  <a href={d.filePath} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost" style={{ marginRight: 4 }}>Görüntüle</a>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onDelete(d.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && <tr><td colSpan={5} className="admin-empty">Belge yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
