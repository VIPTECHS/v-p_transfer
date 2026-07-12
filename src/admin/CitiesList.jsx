import { useEffect, useState } from "react";
import { fetchCountries, fetchCities, createCity, updateCity, deleteCity } from "../api/admin";
import { flagUrl } from "../utils/flags";
import AdminToolbar from "./components/AdminToolbar";

export default function CitiesList() {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCountries().then(setCountries); }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities({ countryId: selectedCountry }).then(setCities);
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCountry || !name.trim()) return;
    await createCity({ name: name.trim(), countryId: selectedCountry });
    setName("");
    fetchCities({ countryId: selectedCountry }).then(setCities);
  };

  const selectedCountryData = countries.find((c) => c.id === selectedCountry);
  const filtered = search
    ? cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : cities;

  return (
    <>
      <AdminToolbar>
        <select
          value={selectedCountry}
          onChange={(e) => { setSelectedCountry(e.target.value); setSearch(""); }}
          aria-label="Ülke"
          style={{ minWidth: 220 }}
        >
          <option value="">Ülke seçin...</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c._count?.cities ?? 0} şehir)
            </option>
          ))}
        </select>
        {selectedCountry && (
          <input
            placeholder="Şehir ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </AdminToolbar>

      {!selectedCountry && (
        <div className="admin-card admin-empty-state">
          <p className="admin-empty-state__icon">🌍</p>
          <p>Şehirleri görüntülemek için bir ülke seçin</p>
          <p className="admin-empty-state__hint">{countries.length} ülke mevcut</p>
        </div>
      )}

      {selectedCountry && (
        <>
          <div className="admin-inline-heading">
            <img src={flagUrl(selectedCountryData?.code)} alt="" width={28} height={21} style={{ borderRadius: 3 }} />
            <span>{selectedCountryData?.name}</span>
            <span className="admin-inline-heading__meta">{cities.length} şehir</span>
          </div>

          <div className="admin-card admin-form-panel">
            <h3>Yeni Şehir</h3>
            <form className="admin-form-grid" onSubmit={handleAdd}>
              <div className="detail-field detail-field--full">
                <label>Şehir adı</label>
                <input placeholder="Yeni şehir adı" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn--primary">Ekle</button>
              </div>
            </form>
          </div>

          <div className="admin-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Şehir</th><th>Acente</th><th>Durum</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c._count?.agencies ?? 0}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() => updateCity(c.id, { isActive: !c.isActive }).then(() => fetchCities({ countryId: selectedCountry }).then(setCities))}
                      >
                        {c.isActive ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td>
                      {(c._count?.agencies ?? 0) === 0 && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          onClick={() => { if (confirm("Şehri sil?")) deleteCity(c.id).then(() => fetchCities({ countryId: selectedCountry }).then(setCities)); }}
                        >
                          Sil
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="admin-empty">
                    {search ? "Sonuç bulunamadı" : "Bu ülkede şehir yok"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
