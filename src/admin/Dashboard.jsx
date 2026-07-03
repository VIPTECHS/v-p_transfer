import { useEffect, useState } from "react";
import { CalendarCheck, Users, Building2, TrendingUp } from "lucide-react";
import { fetchReservations, fetchCustomers, fetchSuppliers, fetchPaymentSummary } from "../api/admin";
import StatusBadge from "./components/StatusBadge";
import { AdminChartCard, AdminPieChart, countBy } from "./components/AdminChart";

const STATUS_LABELS = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR");
}

export default function Dashboard({ navigate }) {
  const [reservations, setReservations] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchReservations(),
      fetchCustomers(),
      fetchSuppliers(),
      fetchPaymentSummary().catch(() => null),
    ])
      .then(([r, c, s, ps]) => {
        setReservations(r);
        setCustomerCount(c.length);
        setSupplierCount(s.length);
        setSummary(ps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;

  const pending = reservations.filter((r) => r.status === "pending").length;
  const confirmed = reservations.filter((r) => r.status === "confirmed").length;

  return (
    <>
      <div className="admin-page-header">
        <h1>Panel</h1>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><CalendarCheck size={20} /></div>
          <div>
            <div className="admin-stat-value">{reservations.length}</div>
            <div className="admin-stat-label">Toplam Rezervasyon</div>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--yellow">
          <div className="admin-stat-icon"><CalendarCheck size={20} /></div>
          <div>
            <div className="admin-stat-value">{pending}</div>
            <div className="admin-stat-label">Bekleyen</div>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-icon"><Users size={20} /></div>
          <div>
            <div className="admin-stat-value">{customerCount}</div>
            <div className="admin-stat-label">Müşteri</div>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-icon"><Building2 size={20} /></div>
          <div>
            <div className="admin-stat-value">{supplierCount}</div>
            <div className="admin-stat-label">Tedarikçi</div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="admin-stats-row" style={{ marginTop: 0 }}>
          <div className="admin-stat-card admin-stat-card--green">
            <div className="admin-stat-icon"><TrendingUp size={20} /></div>
            <div>
              <div className="admin-stat-value">€ {(summary.totalProfit || 0).toFixed(2).replace(".", ",")}</div>
              <div className="admin-stat-label">Toplam Kâr</div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-page-charts">
        <AdminChartCard title="Rezervasyon Durumları" subtitle="Duruma göre dağılım">
          <AdminPieChart data={countBy(reservations, (r) => r.status, STATUS_LABELS)} />
        </AdminChartCard>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Son Rezervasyonlar</h2>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("reservations")}>
            Tümünü gör
          </button>
        </div>
        {reservations.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Müşteri</th>
                <th>Tedarikçi</th>
                <th>Tarih</th>
                <th>Satış</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {reservations.slice(0, 10).map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate("reservation-detail", r.id)}>
                  <td><strong>#{r.reference}</strong></td>
                  <td>{r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—"}</td>
                  <td>{r.supplier?.name || "—"}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{r.saleCurrency === "EUR" ? "€" : r.saleCurrency} {(r.salePrice || 0).toFixed(2).replace(".", ",")}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">Henüz rezervasyon yok</div>
        )}
      </div>
    </>
  );
}
