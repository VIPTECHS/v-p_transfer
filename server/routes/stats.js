import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// GET /stats
router.get("/", async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [today, pending, upcoming, thisMonth, newEnquiries, recentBookings] = await Promise.all([
      prisma.booking.count({
        where: { pickupAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({
        where: {
          pickupAt: { gte: now },
          status: { in: ["pending", "confirmed"] },
        },
      }),
      prisma.booking.count({
        where: { pickupAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.enquiry.count({ where: { status: "new" } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return res.json({
      today,
      pending,
      upcoming,
      thisMonth,
      newEnquiries,
      recentBookings: recentBookings.map((b) => ({
        ...b,
        pickupAt: b.pickupAt.toISOString(),
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /stats", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
