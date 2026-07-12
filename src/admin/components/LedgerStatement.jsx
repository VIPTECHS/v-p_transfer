import { useEffect, useState } from "react";
import { fetchLedger, createLedgerAdjustment } from "../../api/admin";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR");
}

function formatMoney(amount, currency = "EUR") {
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TRY" ? "₺" : `${currency} `;
  return `${sym}${(amount || 0).toFixed(2).replace(".", ",")}`;
}

const TYPE_LABELS = {
  receivable: "Alacak",
  payable: "Borç",
  payment: "Ödeme",
  adjustment: "Düzeltme",
};

export default function LedgerStatement({ entityType, entityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adj, setAdj] = useState({ amount: "", direction: "debit", description: "" });

  const load = () => {
    setLoading(true);
    fetchLedger(entityType, entityId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [entityType, entityId]);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!adj.amount) return;
    try {
      await createLedgerAdjustment(entityType, entityId, {
        amount: Number(adj.amount),
        direction: adj.direction,
        description: adj.description,
        currency: data?.currency || "EUR",
      });
      setAdj({ amount: "", direction: "debit", description: "" });
      load();
    } catch {
      alert("Düzeltme kaydedilemedi");
    }
  };

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;
  if (!data) return <div className="admin-empty">Cari hesap bulunamadı</div>;

  return (
    <div>
      <div className="admin-stats-row" style={{ marginBottom: 16 }}>
        <div className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-value">{formatMoney(data.totalReceivable || data.totalDebit, data.currency)}</div>
          <div className="admin-stat-label">Toplam Alacak</div>
        </div>
        <div className="admin-stat-card admin-stat-card--red">
          <div className="admin-stat-value">{formatMoney(data.totalPayable || data.totalCredit, data.currency)}</div>
          <div className="admin-stat-label">Toplam Borç</div>
        </div>
        <div className="admin-stat-card admin-stat-card--gold">
          <div className="admin-stat-value">{formatMoney(data.pending, data.currency)}</div>
          <div className="admin-stat-label">Bekleyen</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ fontSize: 16 }}>{formatDate(data.lastPaymentDate)}</div>
          <div className="admin-stat-label">Son Ödeme</div>
        </div>
      </div>

      <form onSubmit={handleAdjustment} className="admin-filters" style={{ marginBottom: 16 }}>
        <input type="number" step="0.01" placeholder="Tutar" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} />
        <select value={adj.direction} onChange={(e) => setAdj({ ...adj, direction: e.target.value })}>
          <option value="debit">Borç (+)</option>
          <option value="credit">Alacak (-)</option>
        </select>
        <input type="text" placeholder="Açıklama" value={adj.description} onChange={(e) => setAdj({ ...adj, description: e.target.value })} />
        <button type="submit" className="admin-btn admin-btn--primary">Düzeltme Ekle</button>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tip</th>
              <th>Yön</th>
              <th>Tutar</th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.entryDate)}</td>
                <td>{TYPE_LABELS[e.type] || e.type}</td>
                <td>{e.direction === "debit" ? "Borç" : "Alacak"}</td>
                <td>{formatMoney(e.amount, e.currency)}</td>
                <td>{e.description || "—"}</td>
              </tr>
            ))}
            {data.entries.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">İşlem kaydı yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
