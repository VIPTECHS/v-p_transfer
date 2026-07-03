import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { fetchReservations, createReservation } from "../api/admin";
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

export default function ReservationsList({ navigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.q = search;
    if (statusFilter) params.status = statusFilter;
    fetchReservations(params)
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleCreate = async () => {
    setError("");
    try {
      const r = await createReservation({
        transfers: [{ fromLabel: "Yeni", toLabel: "Yeni", transferDate: new Date().toISOString(), type: "arrival" }],
        passengers: [{ firstName: "Yolcu", lastName: "" }],
      });
      navigate("reservation-detail", r.id);
    } catch (e) {
      setError("Rezervasyon oluşturulamadı");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Rezervasyonlar</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleCreate}>
          <Plus size={14} /> Yeni Rezervasyon
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Referans, müşteri, tedarikçi ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="confirmed">Onaylandı</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal</option>
        </select>
      </div>

      {!loading && (
        <div className="admin-page-charts">
          <AdminChartCard title="Durum Dağılımı" subtitle="Listedeki rezervasyonların durumu">
            <AdminPieChart data={countBy(reservations, (r) => r.status, STATUS_LABELS)} />
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
                <th>Ref No</th>
                <th>Müşteri</th>
                <th>Tedarikçi</th>
                <th>Transfer</th>
                <th>Tarih</th>
                <th>Satış Fiyatı</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} onClick={() => navigate("reservation-detail", r.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <strong>#{r.reference}</strong>
                    {r.bookingId && <span className="reservation-source-badge">Web</span>}
                  </td>
                  <td>{r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—"}</td>
                  <td>{r.supplier?.name || "—"}</td>
                  <td>{r._count?.transfers ?? r.transfers?.length ?? 0}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>
                    {r.saleCurrency === "EUR" ? "€" : r.saleCurrency} {(r.salePrice || 0).toFixed(2).replace(".", ",")}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={7} className="admin-empty">Rezervasyon bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
