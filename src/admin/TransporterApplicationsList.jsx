import { Fragment, useEffect, useState } from "react";
import { fetchTransporterApplications, updateTransporterApplication } from "../api/admin";
import { formatDateTime } from "./utils";
import AdminToolbar from "./components/AdminToolbar";

const STATUSES = [
  { value: "", label: "Tüm başvurular" },
  { value: "new", label: "Yeni" },
  { value: "reviewing", label: "İnceleniyor" },
  { value: "approved", label: "Onaylandı" },
  { value: "rejected", label: "Reddedildi" },
  { value: "archived", label: "Arşiv" },
];

const VEHICLE_LABELS = {
  sedan: "Sedan",
  business_sedan: "Business Sedan",
  suv: "SUV",
  minivan_mpv: "Minivan / MPV",
  vip_van: "VIP Van",
  minibus: "Minibüs",
  coach: "Otobüs / Coach",
};

function ApplicationDetails({ application }) {
  const fields = [
    ["Firma / Taşımacı", application.companyName],
    ["Web / Sosyal Medya", application.onlinePresence],
    ["Ülke / Şehir", application.countryCity],
    ["Yetkili Kişi", application.contactName],
    ["E-posta", application.email],
    ["Telefon / WhatsApp", application.phone],
    ["Hizmet Bölgeleri", application.serviceRegions],
    ["Araç Tipleri", application.vehicleTypes.map((type) => VEHICLE_LABELS[type] || type).join(", ")],
    ["Yaklaşık Araç Sayısı", application.vehicleCount],
    ["7/24 Hizmet", application.offers24h ? "Evet" : "Hayır"],
    ["Sabit / Net B2B Fiyat", application.offersFixedB2bPrice ? "Evet" : "Hayır"],
    ["Gizlilik ve koşul onayı", application.privacyAccepted ? `Onaylandı · ${formatDateTime(application.privacyAcceptedAt)}` : "Onay yok"],
    ["Başvuru tarihi", formatDateTime(application.createdAt)],
  ];

  return (
    <div className="partner-application-admin-details">
      {fields.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          {label === "Web / Sosyal Medya" && value ? (
            <a href={/^https?:\/\//i.test(value) ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a>
          ) : label === "E-posta" ? <a href={`mailto:${value}`}>{value}</a>
            : label === "Telefon / WhatsApp" ? <a href={`tel:${value}`}>{value}</a>
              : <strong>{value || "—"}</strong>}
        </div>
      ))}
      <div className="partner-application-admin-details__wide"><span>Ek not / iş birliği talebi</span><strong>{application.notes || "—"}</strong></div>
    </div>
  );
}

export default function TransporterApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchTransporterApplications({ status: status || undefined })
      .then((items) => { if (active) setApplications(items); })
      .catch(() => { if (active) setError("Taşımacı başvuruları yüklenemedi."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  const changeStatus = async (id, nextStatus) => {
    try {
      const updated = await updateTransporterApplication(id, { status: nextStatus });
      setApplications((items) => status && nextStatus !== status
        ? items.filter((item) => item.id !== id)
        : items.map((item) => item.id === id ? updated : item));
    } catch {
      setError("Başvuru durumu güncellenemedi.");
    }
  };

  return (
    <>
      {error && <div className="admin-error" role="alert">{error}</div>}
      <AdminToolbar>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Başvuru durumu">
          {STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </AdminToolbar>
      <div className="admin-card admin-table-wrap">
        {loading ? <div className="admin-loading">Yükleniyor...</div> : applications.length === 0 ? (
          <div className="admin-empty">Taşımacı partner başvurusu bulunamadı.</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Tarih</th><th>Firma</th><th>Yetkili kişi</th><th>E-posta</th><th>Araç sayısı</th><th>Durum</th></tr></thead>
            <tbody>
              {applications.map((application) => (
                <Fragment key={application.id}>
                  <tr className="clickable" onClick={() => setExpanded(expanded === application.id ? null : application.id)}>
                    <td>{formatDateTime(application.createdAt)}</td>
                    <td>{application.companyName}</td>
                    <td>{application.contactName}</td>
                    <td>{application.email}</td>
                    <td>{application.vehicleCount}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <select value={application.status} onChange={(event) => changeStatus(application.id, event.target.value)} aria-label={`${application.companyName} durumu`}>
                        {STATUSES.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expanded === application.id && <tr><td colSpan={6}><ApplicationDetails application={application} /></td></tr>}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
