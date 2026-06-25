import { Router } from "express";
import prisma from "../lib/prisma.js";
import { notifyStatusChange } from "../lib/notifications.js";

const router = Router();

async function logStatus(bookingId, fromStatus, toStatus, note) {
  await prisma.bookingStatusLog.create({
    data: { bookingId, fromStatus, toStatus, note },
  });
}

const bookingInclude = {
  assignedDriver: true,
  assignedVehicle: true,
  agency: { select: { id: true, name: true } },
  routedAgency: { select: { id: true, name: true } },
  statusLogs: { orderBy: { createdAt: "desc" }, take: 20 },
};

function agencyBookingWhere(agencyCityId, agencyId) {
  return {
    cityId: agencyCityId,
    AND: [
      {
        OR: [
          { routedAgencyId: null },
          { routedAgencyId: agencyId },
        ],
      },
      {
        NOT: {
          AND: [
            { routedAgencyId: agencyId },
            { agencyResponseStatus: "declined" },
          ],
        },
      },
    ],
  };
}

router.get("/profile", async (req, res) => {
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: req.agencyId },
      include: { city: { include: { country: true } } },
    });
    if (!agency) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash, ...safe } = agency;
    return res.json(safe);
  } catch (error) {
    console.error("GET /agency/profile", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/profile", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.phone !== undefined) data.phone = req.body.phone?.trim() || null;
    if (req.body.email !== undefined) data.email = req.body.email?.trim() || null;
    if (req.body.contactName !== undefined) data.contactName = req.body.contactName?.trim() || null;
    if (req.body.address !== undefined) data.address = req.body.address?.trim() || null;

    const agency = await prisma.agency.update({
      where: { id: req.agencyId },
      data,
      include: { city: { include: { country: true } } },
    });
    const { passwordHash, ...safe } = agency;
    return res.json(safe);
  } catch (error) {
    console.error("PATCH /agency/profile", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const where = agencyBookingWhere(req.agencyCityId, req.agencyId);
    if (req.query.status) where.status = req.query.status;
    if (req.query.from || req.query.to) {
      where.pickupAt = {};
      if (req.query.from) where.pickupAt.gte = new Date(req.query.from);
      if (req.query.to) where.pickupAt.lte = new Date(req.query.to);
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { pickupAt: "asc" },
      include: bookingInclude,
    });
    return res.json(bookings);
  } catch (error) {
    console.error("GET /agency/bookings", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, ...agencyBookingWhere(req.agencyCityId, req.agencyId) },
      include: bookingInclude,
    });
    if (!booking) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(booking);
  } catch (error) {
    console.error("GET /agency/bookings/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/bookings/:id/accept", async (req, res) => {
  try {
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, ...agencyBookingWhere(req.agencyCityId, req.agencyId) },
    });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    if (existing.routedAgencyId && existing.routedAgencyId !== req.agencyId) {
      return res.status(403).json({ error: "NOT_ROUTED_TO_YOU" });
    }
    if (existing.status === "cancelled" || existing.status === "completed") {
      return res.status(400).json({ error: "INVALID_STATUS" });
    }
    if (existing.agencyId && existing.agencyId !== req.agencyId) {
      return res.status(409).json({ error: "ALREADY_TAKEN" });
    }
    if (existing.agencyId === req.agencyId && existing.agencyResponseStatus === "accepted") {
      const booking = await prisma.booking.findUnique({
        where: { id: existing.id },
        include: bookingInclude,
      });
      return res.json(booking);
    }

    const now = new Date();
    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        agencyId: req.agencyId,
        routedAgencyId: existing.routedAgencyId || req.agencyId,
        status: "confirmed",
        agencyResponseStatus: "accepted",
        agencyRespondedAt: now,
        agencyDeclineNote: null,
        routedAt: existing.routedAt || now,
      },
      include: bookingInclude,
    });

    await logStatus(booking.id, existing.status, "confirmed", "Acenta tarafından kabul edildi");
    if (existing.status !== "confirmed") {
      await notifyStatusChange(booking, existing.status, "confirmed");
    }

    return res.json(booking);
  } catch (error) {
    console.error("POST /agency/bookings/:id/accept", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/bookings/:id/decline", async (req, res) => {
  try {
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, ...agencyBookingWhere(req.agencyCityId, req.agencyId) },
    });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    if (existing.routedAgencyId && existing.routedAgencyId !== req.agencyId) {
      return res.status(403).json({ error: "NOT_ROUTED_TO_YOU" });
    }
    if (existing.agencyResponseStatus === "accepted") {
      return res.status(400).json({ error: "ALREADY_ACCEPTED" });
    }

    const note = req.body.note?.trim() || null;
    const booking = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        agencyResponseStatus: "declined",
        agencyRespondedAt: new Date(),
        agencyDeclineNote: note,
        agencyId: null,
      },
      include: bookingInclude,
    });

    await logStatus(
      booking.id,
      existing.status,
      existing.status,
      note ? `Acenta reddetti: ${note}` : "Acenta ilanı reddetti",
    );

    return res.json(booking);
  } catch (error) {
    console.error("POST /agency/bookings/:id/decline", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const cityFilter = agencyBookingWhere(req.agencyCityId, req.agencyId);

    const [today, pending, upcoming, thisMonth] = await Promise.all([
      prisma.booking.count({ where: { ...cityFilter, pickupAt: { gte: todayStart, lt: todayEnd }, status: { not: "cancelled" } } }),
      prisma.booking.count({
        where: {
          ...cityFilter,
          status: "pending",
          agencyId: null,
          agencyResponseStatus: { in: [null, "pending"] },
        },
      }),
      prisma.booking.count({ where: { ...cityFilter, pickupAt: { gte: now }, status: { not: "cancelled" } } }),
      prisma.booking.count({ where: { ...cityFilter, createdAt: { gte: monthStart } } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      where: cityFilter,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { agency: { select: { id: true, name: true } } },
    });

    return res.json({ today, pending, upcoming, thisMonth, recentBookings });
  } catch (error) {
    console.error("GET /agency/stats", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
