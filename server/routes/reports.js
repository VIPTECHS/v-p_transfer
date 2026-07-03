import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/revenue", requireAdmin, async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { status: { not: "cancelled" } },
      select: {
        supplierPrice: true,
        salePrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthly = {};
    for (const r of reservations) {
      const key = r.createdAt.toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { month: key, supplierTotal: 0, saleTotal: 0, profit: 0, count: 0 };
      monthly[key].supplierTotal += r.supplierPrice || 0;
      monthly[key].saleTotal += r.salePrice || 0;
      monthly[key].profit += (r.salePrice || 0) - (r.supplierPrice || 0);
      monthly[key].count++;
    }

    return res.json(Object.values(monthly));
  } catch (error) {
    console.error("GET /reports/revenue", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/suppliers", requireAdmin, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        reservations: {
          where: { status: { not: "cancelled" } },
          select: { supplierPrice: true, salePrice: true },
        },
      },
    });

    const result = suppliers.map((s) => {
      const totalSpent = s.reservations.reduce((sum, r) => sum + (r.supplierPrice || 0), 0);
      const totalRevenue = s.reservations.reduce((sum, r) => sum + (r.salePrice || 0), 0);
      return {
        id: s.id,
        name: s.name,
        reservationCount: s.reservations.length,
        totalSpent,
        totalRevenue,
        profit: totalRevenue - totalSpent,
        margin: totalRevenue > 0 ? Math.round(((totalRevenue - totalSpent) / totalRevenue) * 100) : 0,
      };
    });

    return res.json(result.sort((a, b) => b.reservationCount - a.reservationCount));
  } catch (error) {
    console.error("GET /reports/suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
