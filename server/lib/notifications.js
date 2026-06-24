const DEFAULT_WA = "908502554847";

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

export async function notifyStatusChange(booking, fromStatus, toStatus) {
  console.log(`[STATUS] ${booking.reference}: ${fromStatus} → ${toStatus}`);
  return { sent: true };
}

export { DEFAULT_WA as WHATSAPP_NUMBER };
