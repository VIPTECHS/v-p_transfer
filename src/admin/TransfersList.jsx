import { useEffect, useState } from "react";
import { Plane, MapPin, ArrowRight, Search } from "lucide-react";
import { fetchReservations } from "../api/admin";
import { AdminBarChart, AdminChartCard, countBy } from "./components/AdminChart";

const TYPE_LABELS = { arrival: "Varış", departure: "Dönüş", internal: "İç Transfer" };

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR");
}

export default function TransfersList({ navigate }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchReservations()
      .then((reservations) => {
        const all = [];
        for (const r of reservations) {
          for (const t of r.transfers || []) {
            all.push({ ...t, reservation: r });
          }
        }
        all.sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate));
        setTransfers(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? transfers.filter((t) =>
        (t.fromLabel || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.toLabel || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.flightCode || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.reservation.reference || "").toLowerCase().includes(search.toLowerCase())
      )
    : transfers;

  return (
    <>
      <div className="admin-page-header">
        <h1>Transferler</h1>
      </div>

      <div className="admin-filters">
        <div className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Konum, sefer kodu veya referans ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!loading && (
        <div className="admin-page-charts">
          <AdminChartCard title="Transfer Tipleri" subtitle="Varış, dönüş ve iç transfer sayıları">
            <AdminBarChart data={countBy(filtered, (t) => t.type, TYPE_LABELS)} />
          </AdminChartCard>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rezervasyon</th>
                <th>Sefer Kodu</th>
                <th>Nereden</th>
                <th></th>
                <th>Nereye</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Tip</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate("reservation-detail", t.reservation.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td><strong>#{t.reservation.reference}</strong></td>
                  <td>
                    {t.flightCode ? (
                      <span className="transfer-flight-code">{t.flightCode}</span>
                    ) : "—"}
                  </td>
                  <td>
                    <span className="transfer-location">
                      <Plane size={14} className="transfer-location-icon" />
                      {t.fromLabel || "—"}
                    </span>
                  </td>
                  <td><ArrowRight size={14} style={{ color: "#9ca3af" }} /></td>
                  <td>
                    <span className="transfer-location">
                      <MapPin size={14} className="transfer-location-icon" />
                      {t.toLabel || "—"}
                    </span>
                  </td>
                  <td>{formatDate(t.transferDate)}</td>
                  <td>{t.transferTime || "—"}</td>
                  <td>{TYPE_LABELS[t.type] || t.type}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">Transfer bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
