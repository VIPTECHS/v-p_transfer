import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.cityId) where.cityId = req.query.cityId;
    const agencies = await prisma.agency.findMany({
      where,
      orderBy: { name: "asc" },
      include: { city: { include: { country: true } } },
    });
    const safe = agencies.map(({ passwordHash, ...rest }) => rest);
    return res.json(safe);
  } catch (error) {
    console.error("GET /agencies", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: req.params.id },
      include: { city: { include: { country: true } } },
    });
    if (!agency) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash, ...safe } = agency;
    return res.json(safe);
  } catch (error) {
    console.error("GET /agencies/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, cityId, username, password, phone, email, contactName, address } = req.body;
    if (!name?.trim() || !cityId || !username?.trim() || !password) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const agency = await prisma.agency.create({
      data: {
        name: name.trim(),
        cityId,
        username: username.trim().toLowerCase(),
        passwordHash,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        contactName: contactName?.trim() || null,
        address: address?.trim() || null,
      },
      include: { city: { include: { country: true } } },
    });
    const { passwordHash: _, ...safe } = agency;
    return res.status(201).json(safe);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "DUPLICATE_USERNAME" });
    console.error("POST /agencies", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.cityId) data.cityId = req.body.cityId;
    if (req.body.phone !== undefined) data.phone = req.body.phone?.trim() || null;
    if (req.body.email !== undefined) data.email = req.body.email?.trim() || null;
    if (req.body.contactName !== undefined) data.contactName = req.body.contactName?.trim() || null;
    if (req.body.address !== undefined) data.address = req.body.address?.trim() || null;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);
    if (req.body.webhookUrl !== undefined) data.webhookUrl = req.body.webhookUrl?.trim() || null;

    const agency = await prisma.agency.update({
      where: { id: req.params.id },
      data,
      include: { city: { include: { country: true } } },
    });
    const { passwordHash, ...safe } = agency;
    return res.json(safe);
  } catch (error) {
    console.error("PATCH /agencies/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/reset-password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "VALIDATION" });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.agency.update({ where: { id: req.params.id }, data: { passwordHash } });
    return res.json({ success: true });
  } catch (error) {
    console.error("POST /agencies/:id/reset-password", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
