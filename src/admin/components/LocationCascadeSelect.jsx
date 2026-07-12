import { useEffect, useState } from "react";
import { fetchCountries, fetchCities, fetchDistricts } from "../../api/admin";

export default function LocationCascadeSelect({
  countryId,
  cityId,
  districtId,
  onCountryChange,
  onCityChange,
  onDistrictChange,
  required = false,
}) {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }
    fetchCities({ countryId, active: true }).then(setCities).catch(() => {});
  }, [countryId]);

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    fetchDistricts({ cityId, active: true }).then(setDistricts).catch(() => {});
  }, [cityId]);

  return (
    <>
      <div className="detail-field">
        <label>Ülke{required ? " *" : ""}</label>
        <select value={countryId || ""} onChange={(e) => onCountryChange(e.target.value || null)} required={required}>
          <option value="">Seçin</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="detail-field">
        <label>Şehir{required ? " *" : ""}</label>
        <select value={cityId || ""} onChange={(e) => onCityChange(e.target.value || null)} required={required} disabled={!countryId}>
          <option value="">Seçin</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="detail-field">
        <label>İlçe / Bölge</label>
        <select value={districtId || ""} onChange={(e) => onDistrictChange(e.target.value || null)} disabled={!cityId}>
          <option value="">Seçin</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
    </>
  );
}
