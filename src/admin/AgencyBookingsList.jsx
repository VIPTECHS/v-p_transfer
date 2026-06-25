import { useEffect, useState } from "react";
import { acceptAgencyBooking, declineAgencyBooking, fetchAgencyBookings, fetchAgencyBooking, getAgencyInfo } from "../api/admin";
import AgencyBookingDetail from "./AgencyBookingDetail";
import { AgencyAcceptButton } from "./AgencyAcceptPanel";
import { resolveFleetSpec } from "../utils/fleetSpecs";

const STATUSES = ["", "pending", "confirmed", "assigned", "completed", "cancelled"];
const STATUS_LABELS = { "": "Tümü", pending: "Bekleyen", confirmed: "Onaylı", assigned: "Atanmış", completed: "Tamamlandı", cancelled: "İptal" };

function agencyAssignmentLabel(booking, myAgencyId) {
  if (!booking.agencyId) return { text: "Atanmamış", className: "admin-badge--pending" };
  if (booking.agencyId === myAgencyId) return { text: "Sizin", className: "admin-badge--confirmed" };
  return { text: booking.agency?.name || "Başka acenta", className: "admin-badge--cancelled" };
}

function canAccept(booking, myAgencyId) {
  if (booking.status !== "pending") return false;
  if (booking.agencyId && booking.agencyId !== myAgencyId) return false;
  if (booking.routedAgencyId && booking.routedAgencyId !== myAgencyId) return false;
  if (booking.agencyResponseStatus === "declined") return false;
  return true;
}

function isRoutedToMe(booking, myAgencyId) {
  return booking.routedAgencyId === myAgencyId;
}

export default function AgencyBookingsList({ navigate, bookingId }) {
  const [bookings, setBookings] = useState([]);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("");
  const [accepting, setAccepting] = useState(null);
  const [declining, setDeclining] = useState(null);
  const myAgencyId = getAgencyInfo()?.agencyId;

  const load = () => fetchAgencyBookings(status ? { status } : {}).then(setBookings);
  useEffect(() => { load(); }, [status]);

  useEffect(() => {
    if (bookingId) fetchAgencyBooking(bookingId).then(setDetail);
    else setDetail(null);
  }, [bookingId]);

  const handleAccept = async (id, e) => {
    e?.stopPropagation();
    setAccepting(id);
    try {
      await acceptAgencyBooking(id);
      load();
      if (bookingId === id) fetchAgencyBooking(id).then(setDetail);
    } catch (err) {
      if (err.status === 409) alert("Bu ilan başka bir acenta tarafından kabul edildi.");
      else alert("Kabul işlemi başarısız oldu.");
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async (id, note) => {
    setDeclining(id);
    try {
      await declineAgencyBooking(id, note);
      load();
      if (bookingId === id) fetchAgencyBooking(id).then(setDetail);
    } catch {
      alert("Red işlemi başarısız oldu.");
    } finally {
      setDeclining(null);
    }
  };

  if (detail) {
    const assignment = agencyAssignmentLabel(detail, myAgencyId);
    const takenByOther = Boolean(detail.agencyId && detail.agencyId !== myAgencyId);
    const declinedByMe = detail.agencyResponseStatus === "declined" && detail.routedAgencyId === myAgencyId;
    return (
      <AgencyBookingDetail
        detail={detail}
        assignment={assignment}
        canAccept={canAccept(detail, myAgencyId)}
        accepting={accepting === detail.id}
        declining={declining === detail.id}
        takenByOther={takenByOther}
        takenByName={detail.agency?.name}
        declinedByMe={declinedByMe}
        routedToMe={isRoutedToMe(detail, myAgencyId)}
        onBack={() => navigate("bookings")}
        onAccept={() => handleAccept(detail.id)}
        onDecline={(note) => handleDecline(detail.id, note)}
      />
    );
  }

  return (
    <>
      <h1 className="admin-page-title">Randevular</h1>
      <div className="admin-filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Ref</th><th>Müşteri</th><th>Rota</th><th>Tarih</th><th>Araç</th><th>Durum</th><th>Atama</th><th></th></tr></thead>
          <tbody>
            {bookings.map((b) => {
              const assignment = agencyAssignmentLabel(b, myAgencyId);
              const fleet = resolveFleetSpec(b.vehicle);
              return (
                <tr key={b.id}>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate("booking-detail", b.id)}>{b.reference}</td>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate("booking-detail", b.id)}>{b.firstName} {b.lastName || ""}</td>
                  <td style={{ cursor: "pointer", maxWidth: 200 }} onClick={() => navigate("booking-detail", b.id)}>
                    <span className="agency-list-route">{b.fromLabel?.split(",")[0]} → {b.toLabel?.split(",")[0] || "—"}</span>
                  </td>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate("booking-detail", b.id)}>{new Date(b.pickupAt).toLocaleDateString("tr-TR")}</td>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate("booking-detail", b.id)}>
                    {fleet ? (
                      <span className="agency-list-vehicle">
                        {fleet.name}
                        <small>{b.passengers} yolcu</small>
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate("booking-detail", b.id)}><span className={`admin-badge admin-badge--${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span></td>
                  <td><span className={`admin-badge ${assignment.className}`}>{assignment.text}</span></td>
                  <td>
                    {canAccept(b, myAgencyId) && (
                      <AgencyAcceptButton
                        accepting={accepting === b.id}
                        onAccept={(e) => handleAccept(b.id, e)}
                        compact
                      />
                    )}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>Randevu bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
