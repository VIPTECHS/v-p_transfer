const STATUS_LABELS = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  assigned: "Atandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const ENQUIRY_STATUS_LABELS = {
  new: "Yeni",
  read: "Okundu",
  replied: "Yanıtlandı",
  archived: "Arşiv",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function enquiryStatusLabel(status) {
  return ENQUIRY_STATUS_LABELS[status] || status;
}

export function customerName(booking) {
  return [booking.firstName, booking.lastName].filter(Boolean).join(" ");
}

export function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso) {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

export function formatMonthYear(date) {
  return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export function toDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

export function bookingsForDay(bookings, day) {
  return bookings.filter((b) => isSameDay(new Date(b.pickupAt), day));
}
