import { useEffect, useState } from "react";
import { fetchPayments, fetchPaymentSummary } from "../api/admin";
import PaymentBadge from "./components/PaymentBadge";
import { AdminChartCard, AdminPieChart, countBy } from "./components/AdminChart";

const PAYMENT_STATUS_LABELS = {
  paid: "Ödendi",
  partial: "Kısmi",
  unpaid: "Ödenmedi",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR");
}

export default function PaymentsView({ navigate }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    Promise.all([fetchPayments(params), fetchPaymentSummary()])
      .then(([p, s]) => { setPayments(p); setSummary(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  return (
    <>
      <div className="admin-page-header">
        <h1>Ödemeler</h1>
      </div>

      {summary && (
        <div className="admin-stats-row">
          <div className="admin-stat-card admin-stat-card--red">
            <div className="admin-stat-value">€ {(summary.totalSupplierCost || 0).toFixed(2).replace(".", ",")}</div>
            <div className="admin-stat-label">Tedarikçiye Borç</div>
          </div>
          <div className="admin-stat-card admin-stat-card--blue">
            <div className="admin-stat-value">€ {(summary.totalSaleRevenue || 0).toFixed(2).replace(".", ",")}</div>
            <div className="admin-stat-label">Müşteriden Alacak</div>
          </div>
          <div className="admin-stat-card admin-stat-card--green">
            <div className="admin-stat-value">€ {(summary.totalProfit || 0).toFixed(2).replace(".", ",")}</div>
            <div className="admin-stat-label">Net Kâr</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="admin-page-charts">
          <AdminChartCard title="Ödeme Durumu" subtitle="Kayıtların ödeme statüsüne göre dağılımı">
            <AdminPieChart data={countBy(payments, (p) => p.paymentStatus, PAYMENT_STATUS_LABELS)} />
          </AdminChartCard>
        </div>
      )}

      <div className="admin-filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tüm Tipler</option>
          <option value="supplier">Tedarikçi</option>
          <option value="customer">Müşteri</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="paid">Ödendi</option>
          <option value="partial">Kısmi</option>
          <option value="unpaid">Ödenmedi</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Tip</th>
                <th>İlgili</th>
                <th>Tutar</th>
                <th>Ödeme Durumu</th>
                <th>Ödeme Tipi</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={`${p.id}-${p.paymentType}`} onClick={() => navigate("reservation-detail", p.id)} style={{ cursor: "pointer" }}>
                  <td><strong>#{p.reference}</strong></td>
                  <td>{p.paymentType === "supplier" ? "Tedarikçi" : "Müşteri"}</td>
                  <td>{p.relatedName || "—"}</td>
                  <td>{p.currency === "EUR" ? "€" : p.currency} {(p.amount || 0).toFixed(2).replace(".", ",")}</td>
                  <td><PaymentBadge status={p.paymentStatus} /></td>
                  <td>{p.paymentMethod || "—"}</td>
                  <td>{formatDate(p.date)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="admin-empty">Ödeme kaydı bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
