import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};

    if (type === "supplier" && status) {
      where.supplierPaymentStatus = status;
    } else if (type === "customer" && status) {
      where.customerPaymentStatus = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        supplier: true,
        customer: true,
        _count: { select: { transfers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reservations.map((r) => ({
      ...r,
      supplierPaymentDate: r.supplierPaymentDate?.toISOString() ?? null,
      customerPaymentDate: r.customerPaymentDate?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET /payments", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/summary", requireAdmin, async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      select: {
        supplierPrice: true,
        supplierCurrency: true,
        supplierPaymentStatus: true,
        salePrice: true,
        saleCurrency: true,
        customerPaymentStatus: true,
      },
    });

    let supplierTotal = 0;
    let supplierPaid = 0;
    let saleTotal = 0;
    let salePaid = 0;

    for (const r of reservations) {
      const sp = r.supplierPrice || 0;
      const sl = r.salePrice || 0;
      supplierTotal += sp;
      saleTotal += sl;
      if (r.supplierPaymentStatus === "paid") supplierPaid += sp;
      if (r.customerPaymentStatus === "paid") salePaid += sl;
    }

    return res.json({
      supplierTotal,
      supplierPaid,
      supplierUnpaid: supplierTotal - supplierPaid,
      saleTotal,
      salePaid,
      saleUnpaid: saleTotal - salePaid,
      profit: saleTotal - supplierTotal,
    });
  } catch (error) {
    console.error("GET /payments/summary", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
