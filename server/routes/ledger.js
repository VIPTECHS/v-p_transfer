import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { getLedgerSummary } from "../lib/ledger.js";

const router = Router();
router.use(requireAdmin);

router.get("/:entityType/:entityId", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    if (!["customer", "supplier", "agency"].includes(entityType)) {
      return res.status(400).json({ error: "INVALID_ENTITY_TYPE" });
    }
    const summary = await getLedgerSummary(entityType, entityId);
    return res.json(summary);
  } catch (error) {
    console.error("GET /ledger/:entityType/:entityId", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:entityType/:entityId/adjustment", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    if (!["customer", "supplier", "agency"].includes(entityType)) {
      return res.status(400).json({ error: "INVALID_ENTITY_TYPE" });
    }
    const { amount, currency, direction, description, entryDate } = req.body;
    if (!amount || !direction || !["debit", "credit"].includes(direction)) {
      return res.status(400).json({ error: "VALIDATION" });
    }

    const entry = await prisma.ledgerEntry.create({
      data: {
        entityType,
        entityId,
        type: "adjustment",
        direction,
        amount: Number(amount),
        currency: currency || "EUR",
        description: description?.trim() || "Manuel düzeltme",
        entryDate: entryDate ? new Date(entryDate) : new Date(),
      },
    });

    const summary = await getLedgerSummary(entityType, entityId);
    return res.status(201).json(summary);
  } catch (error) {
    console.error("POST /ledger adjustment", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
