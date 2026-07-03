import { useEffect, useState } from "react";
import { createVehicle, fetchVehicles, updateVehicle } from "../api/admin";
import { AdminBarChart, AdminChartCard } from "./components/AdminChart";

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

  const vehicleChartData = [
    { label: "Aktif", value: vehicles.filter((v) => v.isActive).length, color: "#16a34a" },
    { label: "Pasif", value: vehicles.filter((v) => !v.isActive).length, color: "#9ca3af" },
  ];

  return (
    <>
      <h1 className="admin-page-title">Araçlar</h1>
      <form className="admin-filters" onSubmit={handleAdd}>
        <input placeholder="Key (örn. vClassStandard)" value={key} onChange={(e) => setKey(e.target.value)} required />
        <input placeholder="Araç adı" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Plaka" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <button type="submit" className="admin-btn admin-btn--gold">Ekle</button>
      </form>

      <div className="admin-page-charts">
        <AdminChartCard title="Araç Durumu" subtitle="Aktif ve pasif araç sayıları">
          <AdminBarChart data={vehicleChartData} />
        </AdminChartCard>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Key</th><th>Ad</th><th>Plaka</th><th>Durum</th></tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.key}</td>
                <td>{v.name}</td>
                <td>{v.plate || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => updateVehicle(v.id, { isActive: !v.isActive }).then(load)}
                  >
                    {v.isActive ? "Aktif" : "Pasif"}
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
