import { Fragment, useEffect, useState } from "react";
import { fetchEnquiries, updateEnquiry } from "../api/admin";
import { enquiryStatusLabel, formatDateTime } from "./utils";
import AdminToolbar from "./components/AdminToolbar";

const STATUSES = [
  { value: "", label: "Tümü" },
  { value: "new", label: "Yeni" },
  { value: "read", label: "Okundu" },
  { value: "replied", label: "Yanıtlandı" },
  { value: "archived", label: "Arşiv" },
];

export default function EnquiriesList() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    fetchEnquiries({ status: status || undefined })
      .then(setEnquiries)
      .catch(() => setError("Talepler yüklenemedi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateEnquiry(id, { status: newStatus });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch {
      setError("Durum güncellenemedi");
    }
  };

  return (
    <>
      {error && <div className="admin-error">{error}</div>}

      <AdminToolbar>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Durum filtresi">
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </AdminToolbar>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Yükleniyor...</div>
        ) : enquiries.length === 0 ? (
          <div className="admin-empty">Talep bulunamadı</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <Fragment key={e.id}>
                  <tr
                    className="clickable"
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  >
                    <td>{formatDateTime(e.createdAt)}</td>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td>{e.phone || "—"}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${e.status}`}>
                        {enquiryStatusLabel(e.status)}
                      </span>
                    </td>
                    <td onClick={(ev) => ev.stopPropagation()}>
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        style={{ fontSize: 12, padding: "4px 8px" }}
                      >
                        {STATUSES.filter((s) => s.value).map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === e.id && (
                    <tr>
                      <td colSpan={6} style={{ background: "#0d0d0d", padding: "16px 20px" }}>
                        <strong style={{ color: "#d4af37", fontSize: 11, textTransform: "uppercase" }}>
                          Mesaj
                        </strong>
                        <p style={{ margin: "8px 0 0", color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>
                          {e.message}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
