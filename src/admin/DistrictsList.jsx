import { useEffect, useState } from "react";
import { fetchCities, fetchDistricts, createDistrict, updateDistrict, deleteDistrict } from "../api/admin";

import AdminToolbar from "./components/AdminToolbar";

export default function DistrictsList() {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterCity, setFilterCity] = useState("");
  const [name, setName] = useState("");

  const load = () => {
    fetchCities({ active: true }).then(setCities);
    if (filterCity) fetchDistricts({ cityId: filterCity }).then(setDistricts);
    else setDistricts([]);
  };

  useEffect(() => { load(); }, [filterCity]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!filterCity || !name.trim()) return;
    await createDistrict({ name: name.trim(), cityId: filterCity });
    setName("");
    load();
  };

  return (
    <>
      <AdminToolbar>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} aria-label="Şehir">
          <option value="">Şehir seçin</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.country?.name})</option>)}
        </select>
      </AdminToolbar>

      {filterCity && (
        <div className="admin-card admin-form-panel">
          <h3>Yeni İlçe / Bölge</h3>
          <form className="admin-form-grid" onSubmit={handleAdd}>
            <div className="detail-field detail-field--full">
              <label>Ad</label>
              <input placeholder="İlçe / bölge adı" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn--primary">Ekle</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>İlçe / Bölge</th><th>Şehir</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.city?.name}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => updateDistrict(d.id, { isActive: !d.isActive }).then(load)}>
                    {d.isActive ? "Aktif" : "Pasif"}
                  </button>
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => deleteDistrict(d.id).then(load)}>Sil</button>
                </td>
              </tr>
            ))}
            {!filterCity && <tr><td colSpan={4} className="admin-empty">Önce şehir seçin</td></tr>}
            {filterCity && districts.length === 0 && <tr><td colSpan={4} className="admin-empty">İlçe kaydı yok</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
