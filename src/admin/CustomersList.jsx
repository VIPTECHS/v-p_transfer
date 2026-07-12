import { useEffect, useState } from "react";
import { Plus, Search, Pencil, X, Check } from "lucide-react";
import { fetchCustomers, createCustomer, updateCustomer } from "../api/admin";
import AdminToolbar from "./components/AdminToolbar";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", whatsapp: "", identityNo: "", notes: "" });

  const load = () => {
    setLoading(true);
    fetchCustomers(search ? { q: search } : {})
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", whatsapp: "", identityNo: "", notes: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (c) => {
    setForm({ firstName: c.firstName, lastName: c.lastName || "", email: c.email || "", phone: c.phone || "", whatsapp: c.whatsapp || "", identityNo: c.identityNo || "", notes: c.notes || "" });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await updateCustomer(editId, form);
      else await createCustomer(form);
      resetForm();
      load();
    } catch {
      alert("İşlem başarısız");
    }
  };

  return (
    <>
      <div className="admin-page-header admin-page-header--actions-only">
        <div className="admin-page-header__actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={14} /> Yeni Müşteri
          </button>
        </div>
      </div>

      <AdminToolbar>
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input type="text" placeholder="Ad, soyad veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </AdminToolbar>

      {showForm && (
        <div className="admin-card admin-form-panel">
          <h3>{editId ? "Müşteri Düzenle" : "Yeni Müşteri"}</h3>
          <form onSubmit={handleSubmit} className="admin-form-grid">
            <div className="detail-field">
              <label>Ad *</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div className="detail-field">
              <label>Soyad</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>E-posta</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>TCKN / Pasaport</label>
              <input type="text" value={form.identityNo} onChange={(e) => setForm({ ...form, identityNo: e.target.value })} />
            </div>
            <div className="detail-field detail-field--full">
              <label>Notlar</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary"><Check size={14} /> Kaydet</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={resetForm}><X size={14} /> İptal</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>WhatsApp</th>
                <th>Rezervasyon</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.firstName} {c.lastName || ""}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.whatsapp || "—"}</td>
                  <td>{c._count?.reservations ?? 0}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleEdit(c)}>
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Müşteri bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
