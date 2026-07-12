import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAdmin);

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

router.get("/", async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const dayStart = startOfDay(new Date(dateStr));
    const dayEnd = endOfDay(new Date(dateStr));

    const transfers = await prisma.transfer.findMany({
      where: {
        transferDate: { gte: dayStart, lte: dayEnd },
        reservation: { status: { not: "cancelled" } },
      },
      include: {
        reservation: {
          include: {
            customer: true,
            supplier: true,
            agency: true,
            assignedDriver: true,
            assignedVehicle: true,
            passengers: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { transferDate: "asc" },
    });

    return res.json(
      transfers.map((t) => ({
        id: t.id,
        reservationId: t.reservationId,
        reference: t.reservation.reference,
        status: t.reservation.status,
        source: t.reservation.source,
        transferDate: t.transferDate.toISOString(),
        transferTime: t.transferTime,
        fromLabel: t.fromLabel,
        toLabel: t.toLabel,
        flightCode: t.flightCode,
        type: t.type,
        customer: t.reservation.customer,
        supplier: t.reservation.supplier,
        agency: t.reservation.agency,
        assignedDriver: t.reservation.assignedDriver,
        assignedVehicle: t.reservation.assignedVehicle,
        passenger: t.reservation.passengers[0] || null,
        salePrice: t.reservation.salePrice,
        saleCurrency: t.reservation.saleCurrency,
      })),
    );
  } catch (error) {
    console.error("GET /operations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/calendar", async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : startOfDay(new Date());
    const to = req.query.to ? new Date(req.query.to) : endOfDay(new Date());

    const transfers = await prisma.transfer.findMany({
      where: {
        transferDate: { gte: from, lte: to },
        reservation: { status: { not: "cancelled" } },
      },
      include: {
        reservation: {
          include: {
            customer: true,
            supplier: true,
          },
        },
      },
      orderBy: { transferDate: "asc" },
    });

    return res.json(
      transfers.map((t) => ({
        id: t.id,
        reservationId: t.reservationId,
        reference: t.reservation.reference,
        status: t.reservation.status,
        transferDate: t.transferDate.toISOString(),
        transferTime: t.transferTime,
        fromLabel: t.fromLabel,
        toLabel: t.toLabel,
        customerName: t.reservation.customer
          ? `${t.reservation.customer.firstName} ${t.reservation.customer.lastName || ""}`.trim()
          : "—",
        supplierName: t.reservation.supplier?.name || "—",
      })),
    );
  } catch (error) {
    console.error("GET /operations/calendar", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
