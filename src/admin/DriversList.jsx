import { useEffect, useState } from "react";
import { createDriver, fetchDrivers, updateDriver, fetchSuppliers, fetchAgencies } from "../api/admin";

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [linkType, setLinkType] = useState("");
  const [linkId, setLinkId] = useState("");

  const load = () => fetchDrivers().then(setDrivers);

  useEffect(() => {
    load();
    fetchSuppliers().then(setSuppliers).catch(() => {});
    fetchAgencies().then(setAgencies).catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = { name, phone, isActive: true };
    if (linkType === "supplier") data.supplierId = linkId;
    if (linkType === "agency") data.agencyId = linkId;
    await createDriver(data);
    setName(""); setPhone(""); setLinkType(""); setLinkId("");
    load();
  };

  return (
    <>
      <div className="admin-card admin-form-panel">
        <h3>Yeni Sürücü</h3>
        <form className="admin-form-grid" onSubmit={handleAdd}>
          <div className="detail-field">
            <label>Ad Soyad</label>
            <input placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="detail-field">
            <label>Telefon</label>
            <input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="detail-field">
            <label>Bağlantı tipi</label>
            <select value={linkType} onChange={(e) => { setLinkType(e.target.value); setLinkId(""); }}>
              <option value="">Bağımsız</option>
              <option value="supplier">Tedarikçi</option>
              <option value="agency">Acente</option>
            </select>
          </div>
          {linkType === "supplier" && (
            <div className="detail-field">
              <label>Tedarikçi</label>
              <select value={linkId} onChange={(e) => setLinkId(e.target.value)}>
                <option value="">Tedarikçi seç</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {linkType === "agency" && (
            <div className="detail-field">
              <label>Acente</label>
              <select value={linkId} onChange={(e) => setLinkId(e.target.value)}>
                <option value="">Acente seç</option>
                {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary">Ekle</button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ad</th><th>Telefon</th><th>Bağlı Olduğu</th><th>Durum</th></tr></thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.supplier?.name || d.agency?.name || "—"}</td>
                <td>
                  <span className={`admin-pill ${d.isActive ? "admin-pill--green" : "admin-pill--muted"}`}>
                    {d.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => updateDriver(d.id, { isActive: !d.isActive }).then(load)}
                  >
                    Değiştir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
