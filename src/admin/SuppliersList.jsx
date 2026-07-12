import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { fetchSuppliers, createSupplier } from "../api/admin";
import AdminToolbar from "./components/AdminToolbar";

export default function SuppliersList({ navigate }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const load = () => {
    setLoading(true);
    fetchSuppliers(search ? { q: search } : {})
      .then(setSuppliers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const s = await createSupplier({ name: name.trim() });
      setName("");
      setShowForm(false);
      navigate("supplier-detail", s.id);
    } catch {
      alert("Tedarikçi oluşturulamadı");
    }
  };

  return (
    <>
      <div className="admin-page-header admin-page-header--actions-only">
        <div className="admin-page-header__actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Yeni Tedarikçi
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-toolbar" onSubmit={handleCreate}>
          <input placeholder="Firma adı" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
          <button type="submit" className="admin-btn admin-btn--primary">Oluştur</button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>İptal</button>
        </form>
      )}

      <AdminToolbar>
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input type="text" placeholder="Firma veya iletişim ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </AdminToolbar>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Firma</th><th>Şehir</th><th>Telefon</th><th>Rezervasyon</th><th>Durum</th></tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="admin-table-row--clickable" onClick={() => navigate("supplier-detail", s.id)}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.city?.name || "—"}</td>
                  <td>{s.phone || "—"}</td>
                  <td>{s._count?.reservations ?? 0}</td>
                  <td><span className={`admin-pill ${s.isActive ? "admin-pill--green" : "admin-pill--muted"}`}>{s.isActive ? "Aktif" : "Pasif"}</span></td>
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={5} className="admin-empty">Tedarikçi bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
