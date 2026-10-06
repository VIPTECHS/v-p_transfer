import { Fragment, useEffect, useState } from "react";
import { fetchPartnerApplications, updatePartnerApplication } from "../api/admin";
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

const COMPANY_TYPES = {
  travel_agency: "Seyahat Acentesi",
  tour_operator: "Tur Operatörü",
  dmc: "DMC",
  ota: "OTA / Online Seyahat Sitesi",
  corporate_travel: "Kurumsal Seyahat Firması",
  other: "Diğer",
};

const WORK_PREFERENCES = {
  b2b_portal: "B2B Partner Portalı",
  api: "API Entegrasyonu",
  white_label: "White Label",
  other: "Diğer",
};

function websiteUrl(value) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function ApplicationDetails({ application }) {
  const fields = [
    ["Firma / Acente", application.companyName],
    ["Web Sitesi", application.website],
    ["Ülke / Şehir", application.countryCity],
    ["Yetkili Kişi", application.contactName],
    ["E-posta", application.email],
    ["Telefon / WhatsApp", application.phone],
    ["Firma Türü", `${COMPANY_TYPES[application.companyType] || application.companyType}${application.companyTypeOther ? ` — ${application.companyTypeOther}` : ""}`],
    ["Aylık Tahmini Rezervasyon", application.monthlyVolume],
    ["Destinasyonlar", application.destinations],
    ["Çalışma Tercihi", `${WORK_PREFERENCES[application.workPreference] || application.workPreference}${application.workPreferenceOther ? ` — ${application.workPreferenceOther}` : ""}`],
    ["Gizlilik ve koşul onayı", application.privacyAccepted ? `Onaylandı · ${formatDateTime(application.privacyAcceptedAt)}` : "Onay yok"],
    ["Başvuru tarihi", formatDateTime(application.createdAt)],
  ];

  return (
    <div className="partner-application-admin-details">
      {fields.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          {label === "Web Sitesi" && value ? (
            <a href={websiteUrl(value)} target="_blank" rel="noreferrer">{value}</a>
          ) : label === "E-posta" ? (
            <a href={`mailto:${value}`}>{value}</a>
          ) : label === "Telefon / WhatsApp" ? (
            <a href={`tel:${value}`}>{value}</a>
          ) : <strong>{value || "—"}</strong>}
        </div>
      ))}
      <div className="partner-application-admin-details__wide">
        <span>Ek not / talep</span>
        <strong>{application.notes || "—"}</strong>
      </div>
    </div>
  );
}

export default function PartnerApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchPartnerApplications({ status: status || undefined })
      .then((items) => { if (active) setApplications(items); })
      .catch(() => { if (active) setError("Partner başvuruları yüklenemedi."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  const changeStatus = async (id, nextStatus) => {
    try {
      const updated = await updatePartnerApplication(id, { status: nextStatus });
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
          <div className="admin-empty">Partner başvurusu bulunamadı.</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Tarih</th><th>Firma</th><th>Yetkili kişi</th><th>E-posta</th><th>Firma türü</th><th>Hacim</th><th>Durum</th></tr></thead>
            <tbody>
              {applications.map((application) => (
                <Fragment key={application.id}>
                  <tr className="clickable" onClick={() => setExpanded(expanded === application.id ? null : application.id)}>
                    <td>{formatDateTime(application.createdAt)}</td>
                    <td>{application.companyName}</td>
                    <td>{application.contactName}</td>
                    <td>{application.email}</td>
                    <td>{COMPANY_TYPES[application.companyType] || application.companyType}</td>
                    <td>{application.monthlyVolume}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <select value={application.status} onChange={(event) => changeStatus(application.id, event.target.value)} aria-label={`${application.companyName} durumu`}>
                        {STATUSES.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expanded === application.id && (
                    <tr>
                      <td colSpan={7}><ApplicationDetails application={application} /></td>
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
