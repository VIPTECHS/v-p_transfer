import { useEffect, useState } from "react";
import { createDriver, fetchDrivers, updateDriver } from "../api/admin";

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const load = () => fetchDrivers().then(setDrivers);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createDriver({ name, phone, email });
    setName(""); setPhone(""); setEmail("");
    load();
  };

  return (
    <>
      <h1 className="admin-page-title">Şoförler</h1>
      <form className="admin-filters" onSubmit={handleAdd}>
        <input placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="admin-btn admin-btn--gold">Ekle</button>
      </form>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Ad</th><th>Telefon</th><th>E-posta</th><th>Durum</th></tr></thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.email || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => updateDriver(d.id, { isActive: !d.isActive }).then(load)}
                  >
                    {d.isActive ? "Aktif" : "Pasif"}
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
