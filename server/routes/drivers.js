import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: "asc" },
      include: { supplier: true, agency: true },
    });
    return res.json(drivers);
  } catch (error) {
    console.error("GET /drivers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, supplierId, agencyId, isActive } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    if (supplierId && agencyId) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    const driver = await prisma.driver.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        supplierId: supplierId || null,
        agencyId: agencyId || null,
        isActive: isActive !== false,
      },
      include: { supplier: true, agency: true },
    });
    return res.status(201).json(driver);
  } catch (error) {
    console.error("POST /drivers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.phone) data.phone = req.body.phone.trim();
    if (req.body.supplierId !== undefined) data.supplierId = req.body.supplierId || null;
    if (req.body.agencyId !== undefined) data.agencyId = req.body.agencyId || null;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    if (data.supplierId && data.agencyId) {
      return res.status(400).json({ error: "VALIDATION" });
    }

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data,
      include: { supplier: true, agency: true },
    });
    return res.json(driver);
  } catch (error) {
    console.error("PATCH /drivers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
