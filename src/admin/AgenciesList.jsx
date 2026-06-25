import { useEffect, useState } from "react";
import { fetchCities, fetchAgencies, createAgency, updateAgency, resetAgencyPassword } from "../api/admin";

export default function AgenciesList() {
  const [agencies, setAgencies] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ name: "", cityId: "", username: "", password: "", phone: "", email: "", contactName: "" });
  const [filterCity, setFilterCity] = useState("");
  const [resetId, setResetId] = useState(null);
  const [newPass, setNewPass] = useState("");

  const load = () => {
    fetchCities({ active: true }).then(setCities);
    fetchAgencies(filterCity ? { cityId: filterCity } : {}).then(setAgencies);
  };

  useEffect(() => { load(); }, [filterCity]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createAgency(form);
    setForm({ name: "", cityId: "", username: "", password: "", phone: "", email: "", contactName: "" });
    load();
  };

  const handleReset = async (id) => {
    if (!newPass) return;
    await resetAgencyPassword(id, newPass);
    setResetId(null);
    setNewPass("");
  };

  return (
    <>
      <h1 className="admin-page-title">Acenteler</h1>
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
        <input placeholder="İletişim kişisi" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        <button type="submit" className="admin-btn admin-btn--gold">Ekle</button>
      </form>
      <div className="admin-filters">
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
          <option value="">Tüm şehirler</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Acente</th><th>Şehir</th><th>Kullanıcı</th><th>Telefon</th><th>E-posta</th><th>Durum</th><th>İşlem</th></tr></thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.city?.name} ({a.city?.country?.name})</td>
                <td>{a.username}</td>
                <td>{a.phone || "—"}</td>
                <td>{a.email || "—"}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => updateAgency(a.id, { isActive: !a.isActive }).then(load)}>
                    {a.isActive ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td>
                  {resetId === a.id ? (
                    <span style={{ display: "flex", gap: 4 }}>
                      <input placeholder="Yeni şifre" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: 120 }} />
                      <button type="button" className="admin-btn admin-btn--gold" onClick={() => handleReset(a.id)}>Kaydet</button>
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setResetId(null); setNewPass(""); }}>İptal</button>
                    </span>
                  ) : (
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setResetId(a.id)}>Şifre Sıfırla</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
