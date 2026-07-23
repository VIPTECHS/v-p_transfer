import AgencyBookingFleetCard from "./AgencyBookingFleetCard";
import AgencyAcceptPanel from "./AgencyAcceptPanel";
import { BookingDetailHeader, DetailRow, RouteCard, statusLabelTr } from "./bookingDetailShared";

export default function AgencyBookingDetail({
  detail,
  assignment,
  canAccept,
  accepting,
  declining,
  takenByOther,
  takenByName,
  declinedByMe,
  routedToMe,
  onBack,
  onAccept,
  onDecline,
}) {
  const showAcceptPanel = canAccept || takenByOther || declinedByMe;

  return (
    <>
      <button type="button" className="admin-back" onClick={onBack}>← Geri</button>

      <BookingDetailHeader
        reference={detail.reference}
        title={`${detail.firstName} ${detail.lastName || ""}`.trim()}
        badges={
          <>
            <span className={`admin-badge admin-badge--${detail.status}`}>
              {statusLabelTr(detail.status)}
            </span>
            <span className={`admin-badge ${assignment.className}`}>{assignment.text}</span>
            {routedToMe && <span className="admin-badge admin-badge--pending">Size yönlendirildi</span>}
          </>
        }
      />

      {showAcceptPanel && (
        <AgencyAcceptPanel
          accepting={accepting}
          declining={declining}
          onAccept={onAccept}
          onDecline={onDecline}
          takenByOther={takenByOther}
          takenByName={takenByName}
          declinedByMe={declinedByMe}
          routedToMe={routedToMe}
        />
      )}

      <RouteCard
        from={detail.fromLabel}
        to={detail.toLabel}
        pickupAt={detail.pickupAt}
        type={detail.type}
        durationHours={detail.durationHours}
      />

      <div className="admin-detail-grid agency-detail-grid">
        <AgencyBookingFleetCard booking={detail} />

        <div className="admin-detail-section">
          <h3>Müşteri Bilgileri</h3>
          <DetailRow label="Telefon" value={detail.phone} />
          <DetailRow label="E-posta" value={detail.email} />
          {detail.flightNumber && <DetailRow label="Uçuş" value={detail.flightNumber} />}
          {detail.meetAndGreetRequested && <DetailRow label="Karşılama" value={detail.meetAndGreetName || "İstendi"} />}
          {detail.notes && <DetailRow label="Not" value={detail.notes} />}
        </div>

        {(detail.assignedDriver || detail.assignedVehicle) && (
          <div className="admin-detail-section">
            <h3>Operasyon</h3>
            {detail.assignedDriver && <DetailRow label="Şoför" value={detail.assignedDriver.name} />}
            {detail.assignedVehicle && (
              <DetailRow label="Atanan araç" value={`${detail.assignedVehicle.name} (${detail.assignedVehicle.plate || "—"})`} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
