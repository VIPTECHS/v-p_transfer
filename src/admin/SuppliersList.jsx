import { useEffect, useState } from "react";
import { Plus, Search, Pencil, X, Check } from "lucide-react";
import { fetchSuppliers, createSupplier, updateSupplier, fetchCities } from "../api/admin";
import { AdminBarChart, AdminChartCard, countBy } from "./components/AdminChart";

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", contactName: "", address: "", cityId: "" });

  const load = () => {
    setLoading(true);
    Promise.all([fetchSuppliers(search ? { q: search } : {}), fetchCities()])
      .then(([s, c]) => { setSuppliers(s); setCities(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", contactName: "", address: "", cityId: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, phone: s.phone || "", email: s.email || "",
      contactName: s.contactName || "", address: s.address || "",
      cityId: s.cityId || "",
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, cityId: form.cityId ? parseInt(form.cityId) : null };
      if (editId) {
        await updateSupplier(editId, data);
      } else {
        await createSupplier(data);
      }
      resetForm();
      load();
    } catch {
      alert("İşlem başarısız");
    }
  };

  const cityChartData = countBy(suppliers, (s) => s.city?.name || "Belirsiz").slice(0, 6);

  return (
    <>
      <div className="admin-page-header">
        <h1>Tedarikçiler</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Yeni Tedarikçi
        </button>
      </div>

      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input type="text" placeholder="Ad, email, irtibat ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </div>

      {!loading && (
        <div className="admin-page-charts">
          <AdminChartCard title="Şehir Dağılımı" subtitle="Tedarikçilerin bulunduğu şehirler">
            <AdminBarChart data={cityChartData} />
          </AdminChartCard>
        </div>
      )}

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>{editId ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</h3>
          <form onSubmit={handleSubmit} className="admin-form-grid">
            <div className="detail-field">
              <label>Firma Adı *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="detail-field">
              <label>Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>İrtibat Kişisi</label>
              <input type="text" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </div>
            <div className="detail-field">
              <label>Şehir</label>
              <select value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
                <option value="">Seçin</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="detail-field">
              <label>Adres</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
                <th>Firma Adı</th>
                <th>İrtibat</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Şehir</th>
                <th>Rez. Sayısı</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.contactName || "—"}</td>
                  <td>{s.phone || "—"}</td>
                  <td>{s.email || "—"}</td>
                  <td>{s.city?.name || "—"}</td>
                  <td>{s._count?.reservations ?? 0}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={() => handleEdit(s)}>
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={7} className="admin-empty">Tedarikçi bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
