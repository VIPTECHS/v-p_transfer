import prisma from "./prisma.js";

function buildTransferType(bookingType) {
  return bookingType === "hourly" ? "internal" : "arrival";
}

async function resolveCustomer(booking) {
  const email = booking.email?.trim() || null;
  const phone = booking.phone?.trim() || null;

  const where = [];
  if (email) where.push({ email });
  if (phone) where.push({ phone });

  const existing = where.length
    ? await prisma.customer.findFirst({
        where: { OR: where },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const payload = {
    firstName: booking.firstName || "Misafir",
    lastName: booking.lastName || null,
    email,
    phone,
  };

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.customer.create({ data: payload });
}

export async function syncBookingToReservation(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  const existingReservation = await prisma.reservation.findUnique({
    where: { bookingId: booking.id },
  });
  if (existingReservation) return existingReservation;

  const customer = await resolveCustomer(booking);

  const reservation = await prisma.reservation.create({
    data: {
      reference: booking.reference,
      status: booking.status === "cancelled" ? "cancelled" : "pending",
      bookingId: booking.id,
      customerId: customer.id,
      salePrice: booking.quotedPrice,
      saleCurrency: booking.currency || "EUR",
      customerPaymentStatus: booking.paymentStatus === "paid" ? "paid" : "unpaid",
      customerNote: booking.priceNotes || null,
      assignedDriverId: booking.assignedDriverId || null,
      assignedVehicleId: booking.assignedVehicleId || null,
      transfers: {
        create: [
          {
            flightCode: booking.flightNumber || null,
            fromLabel: booking.fromLabel || "",
            toLabel: booking.toLabel || "",
            fromLng: booking.fromLng,
            fromLat: booking.fromLat,
            toLng: booking.toLng,
            toLat: booking.toLat,
            transferDate: booking.pickupAt,
            transferTime: booking.pickupAt ? booking.pickupAt.toISOString().slice(11, 16) : null,
            type: buildTransferType(booking.type),
            sortOrder: 0,
            notes: booking.notes || null,
          },
          ...(booking.returnTransfer
            ? [
                {
                  fromLabel: booking.toLabel || "",
                  toLabel: booking.fromLabel || "",
                  transferDate: booking.pickupAt,
                  type: "departure",
                  sortOrder: 1,
                },
              ]
            : []),
        ],
      },
      passengers: {
        create: [
          {
            firstName: booking.firstName || "Misafir",
            lastName: booking.lastName || null,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  await prisma.reservationStatusLog.create({
    data: {
      reservationId: reservation.id,
      fromStatus: null,
      toStatus: reservation.status,
      note: `Booking ${booking.reference} kaydından otomatik oluşturuldu`,
    },
  });

  return reservation;
}
