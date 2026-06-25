import { useEffect, useState } from "react";
import { fetchCountries, fetchCities, createCity, updateCity, deleteCity } from "../api/admin";
import { flagUrl } from "../utils/flags";

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
      <h1 className="admin-page-title">Şehirler</h1>

      {/* Country selector */}
      <div className="admin-filters" style={{ flexWrap: "wrap", gap: 8 }}>
        <select
          value={selectedCountry}
          onChange={(e) => { setSelectedCountry(e.target.value); setSearch(""); }}
          style={{ minWidth: 250 }}
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
            style={{ minWidth: 180 }}
          />
        )}
      </div>

      {!selectedCountry && (
        <div className="admin-card" style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,.4)" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🌍</p>
          <p>Şehirleri görüntülemek için bir ülke seçin</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>{countries.length} ülke mevcut</p>
        </div>
      )}

      {selectedCountry && (
        <>
          {/* Country header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 12px" }}>
            <img src={flagUrl(selectedCountryData?.code)} alt="" width={28} height={21} style={{ borderRadius: 3 }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>{selectedCountryData?.name}</span>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{cities.length} şehir</span>
          </div>

          {/* Add city form */}
          <form className="admin-filters" onSubmit={handleAdd} style={{ marginBottom: 12 }}>
            <input placeholder="Yeni şehir adı" value={name} onChange={(e) => setName(e.target.value)} required />
            <button type="submit" className="admin-btn admin-btn--gold">Ekle</button>
          </form>

          {/* Cities table */}
          <div className="admin-card">
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
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,.3)" }}>
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
