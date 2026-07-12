import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { getEntityPaymentSummaries } from "../lib/ledger.js";

const router = Router();
router.use(requireAdmin);

router.get("/customers", async (_req, res) => {
  try {
    return res.json(await getEntityPaymentSummaries("customer"));
  } catch (error) {
    console.error("GET /payments/customers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/suppliers", async (_req, res) => {
  try {
    return res.json(await getEntityPaymentSummaries("supplier"));
  } catch (error) {
    console.error("GET /payments/suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/agencies", async (_req, res) => {
  try {
    return res.json(await getEntityPaymentSummaries("agency"));
  } catch (error) {
    console.error("GET /payments/agencies", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/summary", async (_req, res) => {
  try {
    const [customers, suppliers, agencies] = await Promise.all([
      getEntityPaymentSummaries("customer"),
      getEntityPaymentSummaries("supplier"),
      getEntityPaymentSummaries("agency"),
    ]);
    return res.json({
      customers: customers.summary,
      suppliers: suppliers.summary,
      agencies: agencies.summary,
    });
  } catch (error) {
    console.error("GET /payments/summary", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};

    if (type === "supplier" && status) where.supplierPaymentStatus = status;
    else if (type === "customer" && status) where.customerPaymentStatus = status;

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        supplier: true,
        customer: true,
        agency: true,
        _count: { select: { transfers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = [];
    for (const r of reservations) {
      const base = {
        id: r.id,
        reference: r.reference,
        createdAt: r.createdAt.toISOString(),
      };
      if (!type || type === "supplier") {
        rows.push({
          ...base,
          paymentType: "supplier",
          relatedName: r.supplier?.name || "—",
          amount: r.supplierPrice,
          currency: r.supplierCurrency,
          paymentStatus: r.supplierPaymentStatus,
          paymentDate: r.supplierPaymentDate?.toISOString() ?? null,
        });
      }
      if (!type || type === "customer") {
        rows.push({
          ...base,
          paymentType: "customer",
          relatedName: r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—",
          amount: r.salePrice,
          currency: r.saleCurrency,
          paymentStatus: r.customerPaymentStatus,
          paymentDate: r.customerPaymentDate?.toISOString() ?? null,
        });
      }
    }

    return res.json(rows);
  } catch (error) {
    console.error("GET /payments", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
