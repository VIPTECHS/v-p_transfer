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

// GET /operations?date=2026-06-25
router.get("/", async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const dayStart = startOfDay(new Date(dateStr));
    const dayEnd = endOfDay(new Date(dateStr));

    const bookings = await prisma.booking.findMany({
      where: {
        pickupAt: { gte: dayStart, lte: dayEnd },
        status: { not: "cancelled" },
      },
      include: {
        assignedDriver: true,
        assignedVehicle: true,
      },
      orderBy: { pickupAt: "asc" },
    });

    return res.json(
      bookings.map((b) => ({
        ...b,
        pickupAt: b.pickupAt.toISOString(),
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        lastNotifiedAt: b.lastNotifiedAt?.toISOString() ?? null,
      })),
    );
  } catch (error) {
    console.error("GET /operations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
