import { useEffect, useState } from "react";
import {
  fetchCustomerPayments, fetchSupplierPayments, fetchAgencyPayments,
} from "../api/admin";

const TABS = [
  { id: "customer", label: "Müşteri Ödemeleri" },
  { id: "supplier", label: "Tedarikçi Ödemeleri" },
  { id: "agency", label: "Acente Ödemeleri" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR");
}

function formatMoney(amount, currency = "EUR") {
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TRY" ? "₺" : `${currency} `;
  return `${sym}${(amount || 0).toFixed(2).replace(".", ",")}`;
}

export default function PaymentsView({ navigate }) {
  const [tab, setTab] = useState("customer");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === "customer" ? fetchCustomerPayments
      : tab === "supplier" ? fetchSupplierPayments
        : fetchAgencyPayments;
    fetcher()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const detailRoute = tab === "customer" ? "customer-detail" : tab === "supplier" ? "supplier-detail" : "agency-detail";

  return (
    <>
      <div className="settings-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`settings-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : data && (
        <>
          <div className="admin-stats-row">
            <div className="admin-stat-card admin-stat-card--blue">
              <div className="admin-stat-value">{formatMoney(data.summary.totalReceivable, data.summary.currency)}</div>
              <div className="admin-stat-label">Toplam Alacak</div>
            </div>
            <div className="admin-stat-card admin-stat-card--red">
              <div className="admin-stat-value">{formatMoney(data.summary.totalPayable, data.summary.currency)}</div>
              <div className="admin-stat-label">Toplam Borç</div>
            </div>
            <div className="admin-stat-card admin-stat-card--gold">
              <div className="admin-stat-value">{formatMoney(data.summary.pending, data.summary.currency)}</div>
              <div className="admin-stat-label">Bekleyen Ödemeler</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: 16 }}>{formatDate(data.summary.lastPaymentDate)}</div>
              <div className="admin-stat-label">Son Ödeme Tarihi</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: 16 }}>{data.summary.currency || "EUR"}</div>
              <div className="admin-stat-label">Para Birimi</div>
            </div>
          </div>

          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>İlgili</th>
                  <th>Alacak</th>
                  <th>Borç</th>
                  <th>Bekleyen</th>
                  <th>Son Ödeme</th>
                </tr>
              </thead>
              <tbody>
                {data.entities.map((e) => (
                  <tr key={e.id} className="admin-table-row--clickable" onClick={() => navigate(detailRoute, e.id)}>
                    <td>{e.name}</td>
                    <td>{formatMoney(e.totalReceivable, e.currency)}</td>
                    <td>{formatMoney(e.totalPayable, e.currency)}</td>
                    <td>{formatMoney(e.pending, e.currency)}</td>
                    <td>{formatDate(e.lastPaymentDate)}</td>
                  </tr>
                ))}
                {data.entities.length === 0 && (
                  <tr><td colSpan={5} className="admin-empty">Kayıt yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
