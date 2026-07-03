import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { supplierCreateSchema, parseBody } from "../lib/validation.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { q, cityId } = req.query;
    const where = {};
    if (cityId) where.cityId = cityId;
    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
        { contactName: { contains: term } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        city: { include: { country: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(suppliers);
  } catch (error) {
    console.error("GET /suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { city: { include: { country: true } } },
    });
    if (!supplier) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(supplier);
  } catch (error) {
    console.error("GET /suppliers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = parseBody(supplierCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const supplier = await prisma.supplier.create({ data: parsed.data });
    return res.status(201).json(supplier);
  } catch (error) {
    console.error("POST /suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.phone !== undefined) data.phone = req.body.phone;
    if (req.body.email !== undefined) data.email = req.body.email;
    if (req.body.contactName !== undefined) data.contactName = req.body.contactName;
    if (req.body.address !== undefined) data.address = req.body.address;
    if (req.body.cityId !== undefined) data.cityId = req.body.cityId || null;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data });
    return res.json(supplier);
  } catch (error) {
    console.error("PATCH /suppliers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
