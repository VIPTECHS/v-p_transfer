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
      <h1 className="admin-page-title">Ülkeler</h1>
      <form className="admin-filters" onSubmit={handleAdd}>
        <input placeholder="Ülke adı" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Kod (TR, GR...)" value={code} onChange={(e) => setCode(e.target.value)} required style={{ width: 100 }} />
        <button type="submit" className="admin-btn admin-btn--gold">Ekle</button>
      </form>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Ülke</th><th>Kod</th><th>Şehir</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id}>
                <td><img src={flagUrl(c.code)} alt="" width={20} height={15} style={{ verticalAlign: "middle", marginRight: 8, borderRadius: 2 }} /> {c.name}</td>
                <td>{c.code}</td>
                <td>{c._count?.cities ?? 0}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => updateCountry(c.id, { isActive: !c.isActive }).then(load)}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td>
                  {(c._count?.cities ?? 0) === 0 && (
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => { if (confirm("Ülkeyi sil?")) deleteCountry(c.id).then(load); }}>Sil</button>
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
