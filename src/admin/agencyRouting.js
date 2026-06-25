export const AGENCY_RESPONSE_LABELS = {
  open: "Şehir havuzu",
  pending: "Yanıt bekleniyor",
  accepted: "Kabul edildi",
  declined: "Reddedildi",
};

export function agencyResponseLabel(status) {
  if (!status || status === "open") return AGENCY_RESPONSE_LABELS.open;
  return AGENCY_RESPONSE_LABELS[status] || status;
}

export function agencyResponseBadgeClass(status) {
  switch (status) {
    case "pending": return "admin-badge--pending";
    case "accepted": return "admin-badge--confirmed";
    case "declined": return "admin-badge--cancelled";
    default: return "admin-badge--read";
  }
}
