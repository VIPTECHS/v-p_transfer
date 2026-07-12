import { useEffect, useState } from "react";
import { fetchCountries, createCountry, updateCountry, deleteCountry } from "../api/admin";
import { flagUrl } from "../utils/flags";

export default function CountriesList() {
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = () => fetchCountries().then(setCountries);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createCountry({ name, code });
    setName(""); setCode("");
    load();
  };

  return (
    <>
      <div className="admin-card admin-form-panel">
        <h3>Yeni Ülke</h3>
        <form className="admin-form-grid" onSubmit={handleAdd}>
          <div className="detail-field">
            <label>Ülke adı</label>
            <input placeholder="Ülke adı" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="detail-field">
            <label>Kod</label>
            <input placeholder="TR, GR..." value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary">Ekle</button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ülke</th><th>Kod</th><th>Şehir</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id}>
                <td>
                  <img src={flagUrl(c.code)} alt="" width={20} height={15} style={{ verticalAlign: "middle", marginRight: 8, borderRadius: 2 }} />
                  {c.name}
                </td>
                <td><code className="admin-ref">{c.code}</code></td>
                <td>{c._count?.cities ?? 0}</td>
                <td>
                  <span className={`admin-pill ${c.isActive ? "admin-pill--green" : "admin-pill--muted"}`}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ marginLeft: 8 }} onClick={() => updateCountry(c.id, { isActive: !c.isActive }).then(load)}>
                    Değiştir
                  </button>
                </td>
                <td>
                  {(c._count?.cities ?? 0) === 0 && (
                    <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => { if (confirm("Ülkeyi sil?")) deleteCountry(c.id).then(load); }}>Sil</button>
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
