import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { fetchReservations, createReservation } from "../api/admin";
import StatusBadge from "./components/StatusBadge";
import SourceBadge from "./components/SourceBadge";
import AdminToolbar from "./components/AdminToolbar";

function formatDate(iso) {
  if (!iso) return "—";
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
    } catch {
      setError("Rezervasyon oluşturulamadı");
    }
  };

  return (
    <>
      <div className="admin-page-header admin-page-header--actions-only">
        <div className="admin-page-header__actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleCreate}>
            <Plus size={14} /> Yeni Rezervasyon
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <AdminToolbar>
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Referans, müşteri veya tedarikçi ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Durum filtresi">
          <option value="">Tüm durumlar</option>
          <option value="confirmed">Onaylandı</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal</option>
        </select>
      </AdminToolbar>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Referans</th>
                <th>Kaynak</th>
                <th>Müşteri</th>
                <th>Tedarikçi</th>
                <th>Transfer</th>
                <th>Tarih</th>
                <th>Satış</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="admin-table-row--clickable" onClick={() => navigate("reservation-detail", r.id)}>
                  <td><strong className="admin-ref">#{r.reference}</strong></td>
                  <td><SourceBadge source={r.source} agency={r.agency} sourceLabel={r.sourceLabel} /></td>
                  <td>{r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—"}</td>
                  <td>{r.supplier?.name || "—"}</td>
                  <td>{r.transferCount ?? r.transfers?.length ?? 0}</td>
                  <td>{formatDate(r.firstTransferDate || r.transfers?.[0]?.transferDate)}</td>
                  <td>{r.salePrice != null ? `${r.saleCurrency || "EUR"} ${r.salePrice}` : "—"}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">Rezervasyon bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
