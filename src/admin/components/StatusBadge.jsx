const LABELS = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`admin-badge admin-badge--${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
