import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { customerCreateSchema, parseBody } from "../lib/validation.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: { _count: { select: { reservations: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(customers);
  } catch (error) {
    console.error("GET /customers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { reservations: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!customer) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(customer);
  } catch (error) {
    console.error("GET /customers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = parseBody(customerCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const customer = await prisma.customer.create({ data: parsed.data });
    return res.status(201).json(customer);
  } catch (error) {
    console.error("POST /customers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};
    if (req.body.firstName) data.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) data.lastName = req.body.lastName;
    if (req.body.email !== undefined) data.email = req.body.email;
    if (req.body.phone !== undefined) data.phone = req.body.phone;
    if (req.body.identityNo !== undefined) data.identityNo = req.body.identityNo;
    if (req.body.notes !== undefined) data.notes = req.body.notes;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data });
    return res.json(customer);
  } catch (error) {
    console.error("PATCH /customers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
