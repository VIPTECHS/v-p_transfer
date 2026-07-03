import { useEffect, useState } from "react";
import { Plus, Search, Pencil, X, Check } from "lucide-react";
import { fetchCustomers, createCustomer, updateCustomer } from "../api/admin";
import { AdminBarChart, AdminChartCard } from "./components/AdminChart";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", identityNo: "", notes: "" });

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
    setForm({ firstName: "", lastName: "", email: "", phone: "", identityNo: "", notes: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (c) => {
    setForm({ firstName: c.firstName, lastName: c.lastName || "", email: c.email || "", phone: c.phone || "", identityNo: c.identityNo || "", notes: c.notes || "" });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCustomer(editId, form);
      } else {
        await createCustomer(form);
      }
      resetForm();
      load();
    } catch {
      alert("İşlem başarısız");
    }
  };

  const contactChartData = [
    { label: "E-posta var", value: customers.filter((c) => c.email).length, color: "#3b82f6" },
    { label: "Telefon var", value: customers.filter((c) => c.phone).length, color: "#16a34a" },
    { label: "Her ikisi", value: customers.filter((c) => c.email && c.phone).length, color: "#8b5cf6" },
  ];

  return (
    <>
      <div className="admin-page-header">
        <h1>Müşteriler</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Yeni Müşteri
        </button>
      </div>

      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input type="text" placeholder="Ad, soyad, email ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </div>

      {!loading && (
        <div className="admin-page-charts">
          <AdminChartCard title="İletişim Bilgileri" subtitle="Müşteri kayıtlarındaki iletişim alanları">
            <AdminBarChart data={contactChartData} />
          </AdminChartCard>
        </div>
      )}

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>{editId ? "Müşteri Düzenle" : "Yeni Müşteri"}</h3>
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
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>TCKN / Pasaport</label>
              <input type="text" value={form.identityNo} onChange={(e) => setForm({ ...form, identityNo: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>Notlar</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rez. Sayısı</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.firstName}</td>
                  <td>{c.lastName || "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c._count?.reservations ?? 0}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={() => handleEdit(c)}>
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
