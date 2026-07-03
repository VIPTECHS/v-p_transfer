import { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { fetchRevenueReport, fetchSuppliersReport } from "../api/admin";
import { AdminBarChart, AdminChartCard } from "./components/AdminChart";

export default function ReportsView() {
  const [revenue, setRevenue] = useState([]);
  const [suppliersReport, setSuppliersReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("revenue");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRevenueReport(), fetchSuppliersReport()])
      .then(([r, s]) => { setRevenue(r); setSuppliersReport(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;

  const profitChartData = [...revenue]
    .slice(0, 8)
    .reverse()
    .map((row, index) => ({
      label: row.month,
      value: Math.round(row.profit || 0),
      color: index === revenue.length - 1 ? "#16a34a" : "#3b82f6",
    }));

  return (
    <>
      <div className="admin-page-header">
        <h1>Raporlar</h1>
      </div>

      <div className="settings-tabs" style={{ marginBottom: 16 }}>
        <button type="button" className={`settings-tab ${tab === "revenue" ? "active" : ""}`} onClick={() => setTab("revenue")}>
          <BarChart3 size={14} /> Gelir Raporu
        </button>
        <button type="button" className={`settings-tab ${tab === "suppliers" ? "active" : ""}`} onClick={() => setTab("suppliers")}>
          <TrendingUp size={14} /> Tedarikçi Performansı
        </button>
      </div>

      <div className="admin-page-charts">
        <AdminChartCard
          title={tab === "revenue" ? "Aylık Kâr" : "Tedarikçi Rezervasyonları"}
          subtitle={tab === "revenue" ? "Son ayların kâr tutarları (€)" : "Tedarikçi başına rezervasyon sayısı"}
        >
          {tab === "revenue" ? (
            <AdminBarChart
              data={profitChartData}
              valueFormatter={(v) => `€ ${v.toLocaleString("tr-TR")}`}
            />
          ) : (
            <AdminBarChart
              data={suppliersReport.slice(0, 8).map((s, index) => ({
                label: s.name,
                value: s.reservationCount || 0,
                color: ["#3b82f6", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280", "#06b6d4", "#ec4899"][index % 8],
              }))}
            />
          )}
        </AdminChartCard>
      </div>

      {tab === "revenue" && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>Aylık Gelir Özeti</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dönem</th>
                <th>Rezervasyon</th>
                <th>Tedarikçi Maliyeti</th>
                <th>Satış Geliri</th>
                <th>Kâr</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.month}>
                  <td><strong>{r.month}</strong></td>
                  <td>{r.count}</td>
                  <td style={{ color: "#dc2626" }}>€ {(r.supplierTotal || 0).toFixed(2).replace(".", ",")}</td>
                  <td>€ {(r.saleTotal || 0).toFixed(2).replace(".", ",")}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>€ {(r.profit || 0).toFixed(2).replace(".", ",")}</td>
                </tr>
              ))}
              {revenue.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">Veri bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "suppliers" && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>Tedarikçi Performansı</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tedarikçi</th>
                <th>Rez. Sayısı</th>
                <th>Toplam Maliyet</th>
                <th>Toplam Satış</th>
                <th>Kâr</th>
                <th>Marj %</th>
              </tr>
            </thead>
            <tbody>
              {suppliersReport.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.reservationCount}</td>
                  <td style={{ color: "#dc2626" }}>€ {(s.totalCost || 0).toFixed(2).replace(".", ",")}</td>
                  <td>€ {(s.totalSale || 0).toFixed(2).replace(".", ",")}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>€ {(s.profit || 0).toFixed(2).replace(".", ",")}</td>
                  <td>{s.margin || 0}%</td>
                </tr>
              ))}
              {suppliersReport.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Veri bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
