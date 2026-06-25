const STATUS_LABELS = {
  pending: "Bekleyen",
  confirmed: "Onaylı",
  assigned: "Atanmış",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export function DetailRow({ label, value, children }) {
  return (
    <div className="admin-detail-row">
      <span>{label}</span>
      <span>{children ?? value}</span>
    </div>
  );
}

export function RouteCard({ from, to, pickupAt, durationHours, type }) {
  const date = new Date(pickupAt);
  return (
    <div className="agency-route-card">
      <div className="agency-route-time">
        <span className="agency-route-day">
          {date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </span>
        <span className="agency-route-hour">
          {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {type === "hourly" && durationHours && (
          <span className="agency-route-duration">{durationHours} saat</span>
        )}
      </div>
      <div className="agency-route-path">
        <div className="agency-route-point">
          <span className="agency-route-dot agency-route-dot--from" />
          <div>
            <span className="agency-route-label">Kalkış</span>
            <p>{from}</p>
          </div>
        </div>
        <div className="agency-route-line" />
        <div className="agency-route-point">
          <span className="agency-route-dot agency-route-dot--to" />
          <div>
            <span className="agency-route-label">{type === "hourly" ? "Bölge" : "Varış"}</span>
            <p>{to || (type === "hourly" ? "Saatlik tur" : "—")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingDetailHeader({ reference, title, badges }) {
  return (
    <div className="agency-detail-header">
      <div>
        <p className="agency-detail-ref">{reference}</p>
        <h1 className="admin-page-title agency-detail-title">{title}</h1>
      </div>
      <div className="agency-detail-badges">{badges}</div>
    </div>
  );
}

export function statusLabelTr(status) {
  return STATUS_LABELS[status] || status;
}
