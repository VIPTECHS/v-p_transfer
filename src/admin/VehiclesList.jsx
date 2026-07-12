import { useEffect, useState } from "react";
import { createVehicle, fetchVehicles, updateVehicle } from "../api/admin";

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");

  const load = () => fetchVehicles().then(setVehicles);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createVehicle({ key, name, plate });
    setKey(""); setName(""); setPlate("");
    load();
  };

  const activeCount = vehicles.filter((v) => v.isActive).length;

  return (
    <>
      <div className="admin-stats-row admin-stats-row--compact">
        <div className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-value">{activeCount}</div>
          <div className="admin-stat-label">Aktif Araç</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{vehicles.length - activeCount}</div>
          <div className="admin-stat-label">Pasif Araç</div>
        </div>
        <div className="admin-stat-card admin-stat-card--gold">
          <div className="admin-stat-value">{vehicles.length}</div>
          <div className="admin-stat-label">Toplam</div>
        </div>
      </div>

      <div className="admin-card admin-form-panel">
        <h3>Yeni Araç</h3>
        <form className="admin-form-grid" onSubmit={handleAdd}>
          <div className="detail-field">
            <label>Key</label>
            <input placeholder="örn. vClassStandard" value={key} onChange={(e) => setKey(e.target.value)} required />
          </div>
          <div className="detail-field">
            <label>Araç adı</label>
            <input placeholder="Araç adı" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="detail-field">
            <label>Plaka</label>
            <input placeholder="Plaka" value={plate} onChange={(e) => setPlate(e.target.value)} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--primary">Ekle</button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Key</th><th>Ad</th><th>Plaka</th><th>Durum</th></tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td><code className="admin-ref">{v.key}</code></td>
                <td>{v.name}</td>
                <td>{v.plate || "—"}</td>
                <td>
                  <span className={`admin-pill ${v.isActive ? "admin-pill--green" : "admin-pill--muted"}`}>
                    {v.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => updateVehicle(v.id, { isActive: !v.isActive }).then(load)}
                  >
                    Değiştir
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">Henüz araç eklenmedi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
