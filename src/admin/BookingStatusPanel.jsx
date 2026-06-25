import { statusLabelTr } from "./bookingDetailShared";

const FLOW_STEPS = [
  { value: "pending", label: "Bekliyor", short: "1" },
  { value: "confirmed", label: "Onaylı", short: "2" },
  { value: "assigned", label: "Atandı", short: "3" },
  { value: "completed", label: "Tamamlandı", short: "4" },
];

const FLOW_INDEX = Object.fromEntries(FLOW_STEPS.map((s, i) => [s.value, i]));

function getPrimaryAction(status, hasDriver) {
  switch (status) {
    case "pending":
      return {
        label: "Rezervasyonu Onayla",
        next: "confirmed",
        hint: "Müşteriye onay bildirimi gidecek",
        icon: "✓",
      };
    case "confirmed":
      return {
        label: hasDriver ? "Şoför Atandı Olarak İşaretle" : "Şoför Atandı Olarak İlerlet",
        next: "assigned",
        hint: hasDriver ? "Transfer operasyona hazır" : "Şoför seçmeden de ilerletebilirsiniz",
        icon: "→",
      };
    case "assigned":
      return {
        label: "Transferi Tamamla",
        next: "completed",
        hint: "Yolculuk başarıyla tamamlandı",
        icon: "✓",
      };
    default:
      return null;
  }
}

function StepIcon({ step, currentIndex, stepIndex, cancelled }) {
  let state = "upcoming";
  if (cancelled && step.value === "pending") state = "cancelled";
  else if (stepIndex < currentIndex) state = "done";
  else if (stepIndex === currentIndex) state = cancelled ? "cancelled" : "active";

  return (
    <div className={`status-step status-step--${state}`}>
      <div className="status-step-dot">
        {state === "done" ? "✓" : state === "cancelled" ? "✕" : step.short}
      </div>
      <span className="status-step-label">{step.label}</span>
    </div>
  );
}

export default function BookingStatusPanel({
  status,
  saving,
  hasDriver,
  onStatusChange,
  onCancel,
  onDelete,
  deleting,
}) {
  const isTerminal = status === "completed" || status === "cancelled";
  const currentIndex = FLOW_INDEX[status] ?? -1;
  const primary = getPrimaryAction(status, hasDriver);

  return (
    <div className={`status-panel ${isTerminal ? `status-panel--${status}` : ""}`}>
      <div className="status-panel-header">
        <div>
          <h3>Onay & Durum</h3>
          <p className="status-panel-sub">
            {status === "cancelled" && "Bu rezervasyon iptal edildi"}
            {status === "completed" && "Transfer tamamlandı"}
            {status === "pending" && "Rezervasyon onayınızı bekliyor"}
            {status === "confirmed" && "Onaylandı — şoför ataması yapılabilir"}
            {status === "assigned" && "Şoför atandı — transfer devam ediyor"}
          </p>
        </div>
        <span className={`admin-badge admin-badge--${status} status-panel-badge`}>
          {statusLabelTr(status)}
        </span>
      </div>

      {!isTerminal && (
        <div className="status-stepper" aria-label="Rezervasyon durumu">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.value} className="status-stepper-item">
              {i > 0 && (
                <div className={`status-stepper-line ${i <= currentIndex ? "status-stepper-line--done" : ""}`} />
              )}
              <StepIcon step={step} currentIndex={currentIndex} stepIndex={i} cancelled={status === "cancelled"} />
            </div>
          ))}
        </div>
      )}

      {status === "completed" && (
        <div className="status-panel-result status-panel-result--success">
          <span className="status-panel-result-icon">✓</span>
          <div>
            <strong>Transfer tamamlandı</strong>
            <p>Bu rezervasyon başarıyla kapatıldı.</p>
          </div>
        </div>
      )}

      {status === "cancelled" && (
        <div className="status-panel-result status-panel-result--cancelled">
          <span className="status-panel-result-icon">✕</span>
          <div>
            <strong>Rezervasyon iptal edildi</strong>
            <p>Bu ilan artık aktif değil.</p>
          </div>
        </div>
      )}

      {primary && (
        <div className="status-panel-primary">
          <button
            type="button"
            className="status-action-btn status-action-btn--primary"
            disabled={saving}
            onClick={() => onStatusChange(primary.next)}
          >
            <span className="status-action-btn-icon">{primary.icon}</span>
            <span className="status-action-btn-text">
              <strong>{saving ? "Kaydediliyor..." : primary.label}</strong>
              <small>{primary.hint}</small>
            </span>
          </button>
        </div>
      )}

      {!isTerminal && (
        <div className="status-panel-secondary">
          {status !== "pending" && status !== "cancelled" && (
            <button
              type="button"
              className="status-action-btn status-action-btn--ghost"
              disabled={saving}
              onClick={() => onStatusChange("pending")}
            >
              Beklemeye Al
            </button>
          )}
          <button
            type="button"
            className="status-action-btn status-action-btn--danger"
            disabled={saving}
            onClick={onCancel}
          >
            İptal Et
          </button>
        </div>
      )}

      <div className="status-panel-footer">
        <button
          type="button"
          className="status-action-btn status-action-btn--text-danger"
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? "Siliniyor..." : "Rezervasyonu Sil"}
        </button>
      </div>
    </div>
  );
}
