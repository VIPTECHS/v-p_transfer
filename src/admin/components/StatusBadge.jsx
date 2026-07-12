const LABELS = {
  confirmed: "Onaylandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
  pending: "Onaylandı",
};

export default function StatusBadge({ status }) {
  const normalized = status === "pending" ? "confirmed" : status;
  return (
    <span className={`admin-badge admin-badge--${normalized}`}>
      {LABELS[normalized] || status}
    </span>
  );
}
