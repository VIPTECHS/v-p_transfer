import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { fetchCities, fetchAgencies, createAgency } from "../api/admin";

export default function AgenciesList({ navigate }) {
  const [agencies, setAgencies] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ name: "", cityId: "", username: "", password: "", phone: "", email: "" });
  const [filterCity, setFilterCity] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetchCities({ active: true }).then(setCities);
    fetchAgencies(filterCity ? { cityId: filterCity } : {}).then(setAgencies);
  };

  useEffect(() => { load(); }, [filterCity]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const a = await createAgency(form);
      setForm({ name: "", cityId: "", username: "", password: "", phone: "", email: "" });
      setShowForm(false);
      navigate("agency-detail", a.id);
    } catch {
      alert("Acente oluşturulamadı");
    }
  };

  return (
    <>
      <div className="admin-page-header admin-page-header--actions-only">
        <div className="admin-page-header__actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Yeni Acente
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-filters" onSubmit={handleAdd} style={{ flexWrap: "wrap" }}>
          <input placeholder="Acente adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} required>
            <option value="">Şehir seç</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.country?.name})</option>)}
          </select>
          <input placeholder="Kullanıcı adı" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input placeholder="Şifre" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="E-posta" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button type="submit" className="admin-btn admin-btn--primary">Oluştur</button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>İptal</button>
        </form>
      )}

      <div className="admin-filters">
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
          <option value="">Tüm şehirler</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Acente</th><th>Şehir</th><th>Telefon</th><th>E-posta</th><th>Durum</th></tr></thead>
          <tbody>
            {agencies.map((a) => (
                <tr key={a.id} className="admin-table-row--clickable" onClick={() => navigate("agency-detail", a.id)}>
                <td>{a.name}</td>
                <td>{a.city?.name} ({a.city?.country?.name})</td>
                <td>{a.phone || "—"}</td>
                <td>{a.email || "—"}</td>
                <td>{a.isActive ? "Aktif" : "Pasif"}</td>
              </tr>
            ))}
            {agencies.length === 0 && <tr><td colSpan={5} className="admin-empty">Acente bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
