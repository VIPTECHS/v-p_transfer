import { Router } from "express";
import prisma from "../lib/prisma.js";
import { generateReservationReference } from "../lib/reference.js";
import { requireAdmin } from "../middleware/auth.js";
import { reservationCreateSchema, transferSchema, passengerSchema, parseBody } from "../lib/validation.js";

const router = Router();

const VALID_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

function serializeReservation(r) {
  return {
    ...r,
    supplierPaymentDate: r.supplierPaymentDate?.toISOString() ?? null,
    customerPaymentDate: r.customerPaymentDate?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    transfers: r.transfers?.map((t) => ({
      ...t,
      transferDate: t.transferDate.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    passengers: r.passengers?.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    statusLogs: r.statusLogs?.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}

const reservationInclude = {
  supplier: true,
  customer: true,
  assignedVehicle: true,
  assignedDriver: true,
  transfers: { orderBy: { sortOrder: "asc" } },
  passengers: { orderBy: { sortOrder: "asc" } },
  statusLogs: { orderBy: { createdAt: "desc" }, take: 20 },
};

async function logStatus(reservationId, fromStatus, toStatus, note) {
  await prisma.reservationStatusLog.create({
    data: { reservationId, fromStatus, toStatus, note },
  });
}

// GET /reservations
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, from, to, q } = req.query;
    const where = {};

    if (status && VALID_STATUSES.includes(status)) where.status = status;

    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        { reference: { contains: term } },
        { customer: { firstName: { contains: term } } },
        { customer: { lastName: { contains: term } } },
        { supplier: { name: { contains: term } } },
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        ...reservationInclude,
        statusLogs: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reservations.map(serializeReservation));
  } catch (error) {
    console.error("GET /reservations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /reservations/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    if (!reservation) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(serializeReservation(reservation));
  } catch (error) {
    console.error("GET /reservations/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// POST /reservations
router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = parseBody(reservationCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const { transfers, passengers, ...rest } = parsed.data;

    const data = {
      ...rest,
      reference: generateReservationReference(),
      status: rest.status || "pending",
      supplierPaymentDate: rest.supplierPaymentDate ? new Date(rest.supplierPaymentDate) : null,
      customerPaymentDate: rest.customerPaymentDate ? new Date(rest.customerPaymentDate) : null,
    };

    if (transfers?.length) {
      data.transfers = {
        create: transfers.map((t, i) => ({
          ...t,
          transferDate: new Date(t.transferDate),
          sortOrder: t.sortOrder ?? i,
        })),
      };
    }

    if (passengers?.length) {
      data.passengers = {
        create: passengers.map((p, i) => ({
          ...p,
          sortOrder: p.sortOrder ?? i,
        })),
      };
    }

    const reservation = await prisma.reservation.create({
      data,
      include: reservationInclude,
    });

    await logStatus(reservation.id, null, reservation.status, "Rezervasyon oluşturuldu");
    return res.status(201).json(serializeReservation(reservation));
  } catch (error) {
    console.error("POST /reservations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /reservations/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.status && VALID_STATUSES.includes(req.body.status)) data.status = req.body.status;
    if (req.body.supplierId !== undefined) data.supplierId = req.body.supplierId || null;
    if (req.body.supplierPrice !== undefined) data.supplierPrice = req.body.supplierPrice;
    if (req.body.supplierCurrency) data.supplierCurrency = req.body.supplierCurrency;
    if (req.body.supplierPaymentStatus) data.supplierPaymentStatus = req.body.supplierPaymentStatus;
    if (req.body.supplierPaymentType !== undefined) data.supplierPaymentType = req.body.supplierPaymentType;
    if (req.body.supplierPaymentDate !== undefined) data.supplierPaymentDate = req.body.supplierPaymentDate ? new Date(req.body.supplierPaymentDate) : null;
    if (req.body.supplierNote !== undefined) data.supplierNote = req.body.supplierNote;
    if (req.body.customerId !== undefined) data.customerId = req.body.customerId || null;
    if (req.body.salePrice !== undefined) data.salePrice = req.body.salePrice;
    if (req.body.saleCurrency) data.saleCurrency = req.body.saleCurrency;
    if (req.body.customerPaymentStatus) data.customerPaymentStatus = req.body.customerPaymentStatus;
    if (req.body.customerPaymentType !== undefined) data.customerPaymentType = req.body.customerPaymentType;
    if (req.body.customerPaymentDate !== undefined) data.customerPaymentDate = req.body.customerPaymentDate ? new Date(req.body.customerPaymentDate) : null;
    if (req.body.customerNote !== undefined) data.customerNote = req.body.customerNote;
    if (req.body.assignedVehicleId !== undefined) data.assignedVehicleId = req.body.assignedVehicleId || null;
    if (req.body.assignedDriverId !== undefined) data.assignedDriverId = req.body.assignedDriverId || null;

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data,
      include: reservationInclude,
    });

    if (data.status && data.status !== existing.status) {
      await logStatus(reservation.id, existing.status, data.status, req.body.statusNote || null);
    }

    return res.json(serializeReservation(reservation));
  } catch (error) {
    console.error("PATCH /reservations/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// DELETE /reservations/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    await prisma.reservation.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /reservations/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// --- Transfer sub-resource ---

// POST /reservations/:id/transfers
router.post("/:id/transfers", requireAdmin, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { transfers: true },
    });
    if (!reservation) return res.status(404).json({ error: "NOT_FOUND" });

    const parsed = parseBody(transferSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const transfer = await prisma.transfer.create({
      data: {
        ...parsed.data,
        reservationId: req.params.id,
        transferDate: new Date(parsed.data.transferDate),
        sortOrder: parsed.data.sortOrder ?? reservation.transfers.length,
      },
    });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.status(201).json(serializeReservation(updated));
  } catch (error) {
    console.error("POST /reservations/:id/transfers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /reservations/:id/transfers/:transferId
router.patch("/:id/transfers/:transferId", requireAdmin, async (req, res) => {
  try {
    const transfer = await prisma.transfer.findFirst({
      where: { id: req.params.transferId, reservationId: req.params.id },
    });
    if (!transfer) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.flightCode !== undefined) data.flightCode = req.body.flightCode;
    if (req.body.fromLabel) data.fromLabel = req.body.fromLabel;
    if (req.body.toLabel) data.toLabel = req.body.toLabel;
    if (req.body.transferDate) data.transferDate = new Date(req.body.transferDate);
    if (req.body.transferTime !== undefined) data.transferTime = req.body.transferTime;
    if (req.body.type) data.type = req.body.type;
    if (req.body.sortOrder !== undefined) data.sortOrder = req.body.sortOrder;
    if (req.body.notes !== undefined) data.notes = req.body.notes;
    if (req.body.fromLng !== undefined) data.fromLng = req.body.fromLng;
    if (req.body.fromLat !== undefined) data.fromLat = req.body.fromLat;
    if (req.body.toLng !== undefined) data.toLng = req.body.toLng;
    if (req.body.toLat !== undefined) data.toLat = req.body.toLat;

    await prisma.transfer.update({ where: { id: req.params.transferId }, data });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.json(serializeReservation(updated));
  } catch (error) {
    console.error("PATCH /reservations/:id/transfers/:transferId", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// DELETE /reservations/:id/transfers/:transferId
router.delete("/:id/transfers/:transferId", requireAdmin, async (req, res) => {
  try {
    const transfer = await prisma.transfer.findFirst({
      where: { id: req.params.transferId, reservationId: req.params.id },
    });
    if (!transfer) return res.status(404).json({ error: "NOT_FOUND" });
    await prisma.transfer.delete({ where: { id: req.params.transferId } });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.json(serializeReservation(updated));
  } catch (error) {
    console.error("DELETE /reservations/:id/transfers/:transferId", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// --- Passenger sub-resource ---

// POST /reservations/:id/passengers
router.post("/:id/passengers", requireAdmin, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { passengers: true },
    });
    if (!reservation) return res.status(404).json({ error: "NOT_FOUND" });

    const parsed = parseBody(passengerSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    await prisma.passenger.create({
      data: {
        ...parsed.data,
        reservationId: req.params.id,
        sortOrder: parsed.data.sortOrder ?? reservation.passengers.length,
      },
    });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.status(201).json(serializeReservation(updated));
  } catch (error) {
    console.error("POST /reservations/:id/passengers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /reservations/:id/passengers/:passengerId
router.patch("/:id/passengers/:passengerId", requireAdmin, async (req, res) => {
  try {
    const passenger = await prisma.passenger.findFirst({
      where: { id: req.params.passengerId, reservationId: req.params.id },
    });
    if (!passenger) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.firstName) data.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) data.lastName = req.body.lastName;
    if (req.body.identityNumber !== undefined) data.identityNumber = req.body.identityNumber;
    if (req.body.sortOrder !== undefined) data.sortOrder = req.body.sortOrder;

    await prisma.passenger.update({ where: { id: req.params.passengerId }, data });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.json(serializeReservation(updated));
  } catch (error) {
    console.error("PATCH /reservations/:id/passengers/:passengerId", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// DELETE /reservations/:id/passengers/:passengerId
router.delete("/:id/passengers/:passengerId", requireAdmin, async (req, res) => {
  try {
    const passenger = await prisma.passenger.findFirst({
      where: { id: req.params.passengerId, reservationId: req.params.id },
    });
    if (!passenger) return res.status(404).json({ error: "NOT_FOUND" });
    await prisma.passenger.delete({ where: { id: req.params.passengerId } });

    const updated = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: reservationInclude,
    });
    return res.json(serializeReservation(updated));
  } catch (error) {
    console.error("DELETE /reservations/:id/passengers/:passengerId", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
