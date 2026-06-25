import { Router } from "express";
import prisma from "../lib/prisma.js";
import { generateReference } from "../lib/reference.js";
import { notifyNewBooking, notifyStatusChange } from "../lib/notifications.js";
import { matchBookingToCity } from "../lib/cityMatcher.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["pending", "confirmed", "assigned", "completed", "cancelled"];
function mapBookingPayload(body) {
  const fromCoords = body.fromCoords || {};
  const toCoords = body.toCoords || {};

  return {
    type: body.type || "transfer",
    pickupAt: new Date(body.pickupAt),
    fromLabel: body.from || body.fromLabel || "",
    toLabel: body.to || body.toLabel || null,
    durationHours: body.durationHours != null ? Number(body.durationHours) : null,
    fromLng: fromCoords.lng ?? body.fromLng ?? null,
    fromLat: fromCoords.lat ?? body.fromLat ?? null,
    toLng: toCoords.lng ?? body.toLng ?? null,
    toLat: toCoords.lat ?? body.toLat ?? null,
    firstName: body.firstName || "",
    lastName: body.lastName || null,
    email: body.email || "",
    phone: body.phone || "",
    passengers: Number(body.passengers) || 1,
    luggage: Number(body.luggage) || 0,
    childSeat: Number(body.childSeat) || 0,
    vehicle: body.vehicle || null,
    notes: body.notes || null,
    flightNumber: body.flightNumber?.trim() || null,
    meetAndGreetName: body.meetAndGreetName?.trim() || null,
    returnTransfer: Boolean(body.returnTransfer),
  };
}

function serializeBooking(booking) {
  return {
    ...booking,
    pickupAt: booking.pickupAt.toISOString(),
    lastNotifiedAt: booking.lastNotifiedAt?.toISOString() ?? null,
    routedAt: booking.routedAt?.toISOString() ?? null,
    agencyRespondedAt: booking.agencyRespondedAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    assignedDriver: booking.assignedDriver || undefined,
    assignedVehicle: booking.assignedVehicle || undefined,
    city: booking.city || undefined,
    agency: booking.agency || undefined,
    routedAgency: booking.routedAgency || undefined,
    statusLogs: booking.statusLogs?.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

async function logStatus(bookingId, fromStatus, toStatus, note) {
  await prisma.bookingStatusLog.create({
    data: { bookingId, fromStatus, toStatus, note },
  });
}

const bookingInclude = {
  assignedDriver: true,
  assignedVehicle: true,
  city: { include: { country: true } },
  agency: { select: { id: true, name: true, phone: true, email: true } },
  routedAgency: { select: { id: true, name: true, phone: true, email: true } },
  statusLogs: { orderBy: { createdAt: "desc" }, take: 20 },
};

// POST /bookings — public
router.post("/", async (req, res) => {
  try {
    const payload = mapBookingPayload(req.body);

    if (!payload.pickupAt || Number.isNaN(payload.pickupAt.getTime())) {
      return res.status(400).json({ error: "INVALID_PICKUP" });
    }
    if (!payload.fromLabel?.trim()) {
      return res.status(400).json({ error: "INVALID_FROM" });
    }
    if (payload.type === "transfer" && !payload.toLabel?.trim()) {
      return res.status(400).json({ error: "INVALID_TO" });
    }
    if (!payload.firstName?.trim() || !payload.email?.trim() || !payload.phone?.trim()) {
      return res.status(400).json({ error: "INVALID_CONTACT" });
    }

    const booking = await prisma.booking.create({
      data: {
        ...payload,
        reference: generateReference(),
        status: "pending",
        notificationStatus: "none",
      },
    });

    const cityMatch = await matchBookingToCity(booking);
    if (cityMatch.cityId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { cityId: cityMatch.cityId },
      });
      booking.cityId = cityMatch.cityId;
    }

    await logStatus(booking.id, null, "pending", "Booking created");
    await notifyNewBooking(booking);

    return res.status(201).json({
      success: true,
      reference: booking.reference,
      booking: serializeBooking(booking),
    });
  } catch (error) {
    console.error("POST /bookings", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /bookings — admin
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, from, to, q } = req.query;
    const where = {};

    if (status && VALID_STATUSES.includes(status)) where.status = status;

    if (from || to) {
      where.pickupAt = {};
      if (from) where.pickupAt.gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.pickupAt.lte = end;
      }
    }

    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
        { reference: { contains: term } },
        { fromLabel: { contains: term } },
        { toLabel: { contains: term } },
        { flightNumber: { contains: term } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { pickupAt: "asc" },
    });

    return res.json(bookings.map(serializeBooking));
  } catch (error) {
    console.error("GET /bookings", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: bookingInclude,
    });
    if (!booking) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(serializeBooking(booking));
  } catch (error) {
    console.error("GET /bookings/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.status && VALID_STATUSES.includes(req.body.status)) data.status = req.body.status;
    if (req.body.notes !== undefined) data.notes = req.body.notes;
    if (req.body.firstName) data.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) data.lastName = req.body.lastName;
    if (req.body.email) data.email = req.body.email;
    if (req.body.phone) data.phone = req.body.phone;
    if (req.body.vehicle !== undefined) data.vehicle = req.body.vehicle;
    if (req.body.pickupAt) data.pickupAt = new Date(req.body.pickupAt);
    if (req.body.flightNumber !== undefined) data.flightNumber = req.body.flightNumber;
    if (req.body.meetAndGreetName !== undefined) data.meetAndGreetName = req.body.meetAndGreetName;
    if (req.body.returnTransfer !== undefined) data.returnTransfer = Boolean(req.body.returnTransfer);
    if (req.body.assignedDriverId !== undefined) data.assignedDriverId = req.body.assignedDriverId || null;
    if (req.body.assignedVehicleId !== undefined) data.assignedVehicleId = req.body.assignedVehicleId || null;
    if (req.body.notificationStatus) data.notificationStatus = req.body.notificationStatus;
    if (req.body.lastNotifiedAt) data.lastNotifiedAt = new Date(req.body.lastNotifiedAt);
    if (req.body.agencyId !== undefined) data.agencyId = req.body.agencyId || null;
    if (req.body.cityId !== undefined) data.cityId = req.body.cityId || null;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data,
      include: bookingInclude,
    });

    if (data.status && data.status !== existing.status) {
      await logStatus(booking.id, existing.status, data.status, req.body.statusNote || null);
      await notifyStatusChange(booking, existing.status, data.status);
    }

    if (req.body.assignedDriverId || req.body.assignedVehicleId) {
      await prisma.bookingAssignment.create({
        data: {
          bookingId: booking.id,
          driverId: req.body.assignedDriverId || null,
          vehicleId: req.body.assignedVehicleId || null,
          notes: req.body.assignmentNote || null,
        },
      });
    }

    return res.json(serializeBooking(booking));
  } catch (error) {
    console.error("PATCH /bookings/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/route-agency", requireAdmin, async (req, res) => {
  try {
    const { agencyId } = req.body;
    if (!agencyId) return res.status(400).json({ error: "VALIDATION" });

    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const agency = await prisma.agency.findFirst({
      where: { id: agencyId, isActive: true },
    });
    if (!agency) return res.status(404).json({ error: "AGENCY_NOT_FOUND" });
    if (existing.cityId && agency.cityId !== existing.cityId) {
      return res.status(400).json({ error: "AGENCY_CITY_MISMATCH" });
    }

    const now = new Date();
    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        routedAgencyId: agency.id,
        routedAt: now,
        agencyResponseStatus: "pending",
        agencyRespondedAt: null,
        agencyDeclineNote: null,
        agencyId: null,
        cityId: existing.cityId || agency.cityId,
      },
      include: bookingInclude,
    });

    await logStatus(
      booking.id,
      existing.status,
      existing.status,
      `${agency.name} acentasına yönlendirildi`,
    );

    return res.json(serializeBooking(booking));
  } catch (error) {
    console.error("POST /bookings/:id/route-agency", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/clear-agency-route", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        routedAgencyId: null,
        routedAt: null,
        agencyResponseStatus: null,
        agencyRespondedAt: null,
        agencyDeclineNote: null,
        agencyId: null,
      },
      include: bookingInclude,
    });

    await logStatus(booking.id, existing.status, existing.status, "Acenta yönlendirmesi kaldırıldı — şehir havuzuna açıldı");

    return res.json(serializeBooking(booking));
  } catch (error) {
    console.error("POST /bookings/:id/clear-agency-route", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    await prisma.booking.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /bookings/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
