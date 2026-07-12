import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { serializeDocument } from "../lib/entityResources.js";

const router = Router();
router.use(requireAdmin);

router.get("/expiring", async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const until = new Date();
    until.setDate(until.getDate() + days);

    const docs = await prisma.entityDocument.findMany({
      where: {
        expiresAt: { lte: until, gte: new Date() },
      },
      orderBy: { expiresAt: "asc" },
    });

    const enriched = await Promise.all(
      docs.map(async (doc) => {
        let entityName = "—";
        if (doc.entityType === "supplier") {
          const s = await prisma.supplier.findUnique({ where: { id: doc.entityId }, select: { name: true } });
          entityName = s?.name || entityName;
        } else if (doc.entityType === "agency") {
          const a = await prisma.agency.findUnique({ where: { id: doc.entityId }, select: { name: true } });
          entityName = a?.name || entityName;
        }
        const daysLeft = Math.ceil((doc.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
        return { ...serializeDocument(doc), entityName, daysLeft };
      }),
    );

    return res.json(enriched);
  } catch (error) {
    console.error("GET /documents/expiring", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
