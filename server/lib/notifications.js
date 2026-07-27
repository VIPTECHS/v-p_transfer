import prisma from "./prisma.js";
import { esc, panelUrl, sendTelegramInBackground } from "./telegram.js";

const DEFAULT_WA = "908502554847";

const DATE_FMT = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FMT.format(date);
}

/**
 * Rezervasyonun panel linki. Site rezervasyonu (Booking) kaydedildikten sonra
 * eşlenen Reservation kaydına derin link verebilmek için arıyoruz; eşleme
 * henüz oluşmadıysa liste sayfasına düşüyoruz.
 */
async function bookingPanelUrl(bookingId) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { bookingId },
      select: { id: true },
    });
    if (reservation) return panelUrl(`/reservation/${reservation.id}`);
  } catch {
    // Link ikincil bir kolaylık — bulunamazsa bildirimi engellemesin.
  }
  return panelUrl("/reservations");
}

/**
 * Build WhatsApp deeplink with pre-filled message.
 */
export function buildWhatsAppLink(phone, message) {
  const clean = (phone || DEFAULT_WA).replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function bookingReceivedMessage(booking) {
  return `Hello ${booking.firstName}, your VIP Transfer booking ${booking.reference} has been received. Pickup: ${booking.fromLabel}${booking.toLabel ? ` → ${booking.toLabel}` : ""} on ${new Date(booking.pickupAt).toLocaleString()}. We will confirm shortly.`;
}

export function driverAssignedMessage(booking, driver) {
  return `Hello ${booking.firstName}, your driver ${driver?.name || "is assigned"} for booking ${booking.reference}. Contact: ${driver?.phone || "will be shared soon"}.`;
}

export function vehicleApproachingMessage(booking) {
  return `Hello ${booking.firstName}, your chauffeur is on the way for booking ${booking.reference}. Please be ready at the pickup point.`;
}

export function thankYouMessage(booking) {
  return `Thank you for choosing VIP Transfer, ${booking.firstName}! We hope you enjoyed your ride (${booking.reference}). We would appreciate your feedback.`;
}

/**
 * Notify admin of new booking (console + optional webhook).
 */
export async function notifyNewBooking(booking) {
  const summary = `[NEW BOOKING] ${booking.reference} — ${booking.firstName} ${booking.lastName || ""} — ${booking.fromLabel} → ${booking.toLabel || "hourly"} — ${booking.pickupAt}`;
  console.log(summary);

  const url = await bookingPanelUrl(booking.id);
  const route = booking.toLabel
    ? `${esc(booking.fromLabel)} → ${esc(booking.toLabel)}`
    : `${esc(booking.fromLabel)} · ${booking.durationHours || "?"} saat`;
  const extras = [
    booking.vehicle && esc(booking.vehicle),
    `${booking.passengers} yolcu`,
    booking.luggage ? `${booking.luggage} valiz` : null,
    booking.flightNumber ? `✈ ${esc(booking.flightNumber)}` : null,
  ].filter(Boolean);

  sendTelegramInBackground(
    [
      `🔔 <b>Yeni Rezervasyon</b> — <code>${esc(booking.reference)}</code>`,
      "",
      `${esc(booking.firstName)} ${esc(booking.lastName || "")} · ${esc(booking.phone)}`,
      route,
      formatDate(booking.pickupAt),
      extras.join(" · "),
      booking.quotedPrice ? `💰 ${booking.quotedPrice} ${esc(booking.currency)}` : null,
      "",
      `<a href="${url}">→ Panelde aç</a>`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );

  const webhook = process.env.ADMIN_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_booking", booking }),
      });
    } catch (err) {
      console.error("Webhook notify failed:", err.message);
    }
  }

  return { sent: true, channel: webhook ? "webhook" : "console" };
}

// Her durum değişikliği bildirim hak etmiyor; gürültü yapmasın diye yalnızca
// aksiyon gerektiren geçişler Telegram'a düşüyor.
const NOTIFY_STATUSES = {
  cancelled: "❌ <b>Rezervasyon İptal</b>",
  confirmed: "✅ <b>Rezervasyon Onaylandı</b>",
};

export async function notifyStatusChange(booking, fromStatus, toStatus) {
  console.log(`[STATUS] ${booking.reference}: ${fromStatus} → ${toStatus}`);

  const heading = NOTIFY_STATUSES[toStatus];
  if (heading && fromStatus !== toStatus) {
    const url = await bookingPanelUrl(booking.id);
    sendTelegramInBackground(
      [
        `${heading} — <code>${esc(booking.reference)}</code>`,
        "",
        `${esc(booking.firstName)} ${esc(booking.lastName || "")}`,
        `${esc(booking.fromLabel)}${booking.toLabel ? ` → ${esc(booking.toLabel)}` : ""}`,
        formatDate(booking.pickupAt),
        `${esc(fromStatus || "—")} → ${esc(toStatus)}`,
        "",
        `<a href="${url}">→ Panelde aç</a>`,
      ].join("\n"),
    );
  }

  return { sent: true };
}

/**
 * İletişim formundan gelen teklif talebi. Satış fırsatı olduğu için
 * geciktirmeden haber vermek istiyoruz.
 */
export async function notifyNewEnquiry(enquiry) {
  console.log(`[NEW ENQUIRY] ${enquiry.name} <${enquiry.email}>`);

  sendTelegramInBackground(
    [
      "✉️ <b>Yeni İletişim Talebi</b>",
      "",
      `${esc(enquiry.name)} · ${esc(enquiry.email)}`,
      enquiry.phone ? esc(enquiry.phone) : null,
      "",
      `<i>${esc(enquiry.message).slice(0, 500)}</i>`,
      "",
      `<a href="${panelUrl("/settings")}">→ Panelde aç</a>`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );

  return { sent: true };
}

export { DEFAULT_WA as WHATSAPP_NUMBER };
