import prisma from "./prisma.js";

// Reservation reference format for the agencies' accounting software:
// 352 (fixed code) + YY + MM + DD + NNNN (daily sequence, resets every day)
// e.g. 3522607110001
const RESERVATION_CODE = "352";

// Both bookings and reservations draw from the same daily sequence so the
// number the customer receives at booking time is the one accounting uses.
async function nextDailySequence(datePrefix) {
  const [bookings, reservations] = await Promise.all([
    prisma.booking.findMany({
      where: { reference: { startsWith: datePrefix } },
      select: { reference: true },
    }),
    prisma.reservation.findMany({
      where: { reference: { startsWith: datePrefix } },
      select: { reference: true },
    }),
  ]);

  let max = 0;
  for (const { reference } of [...bookings, ...reservations]) {
    const seq = parseInt(reference.slice(datePrefix.length), 10);
    if (!Number.isNaN(seq) && seq > max) max = seq;
  }
  return max + 1;
}

async function referenceExists(reference) {
  const [booking, reservation] = await Promise.all([
    prisma.booking.findUnique({ where: { reference } }),
    prisma.reservation.findUnique({ where: { reference } }),
  ]);
  return Boolean(booking || reservation);
}

export async function generateReservationReference() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePrefix = `${RESERVATION_CODE}${yy}${mm}${dd}`;

  let seq = await nextDailySequence(datePrefix);
  let reference = `${datePrefix}${String(seq).padStart(4, "0")}`;

  while (await referenceExists(reference)) {
    seq += 1;
    reference = `${datePrefix}${String(seq).padStart(4, "0")}`;
  }

  return reference;
}

// Booking-time reference: same 352YYMMDDNNNN scheme as reservations.
export const generateBookingReference = generateReservationReference;
