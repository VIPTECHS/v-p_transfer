import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.countryId) where.countryId = req.query.countryId;
    if (req.query.active === "true") {
      where.isActive = true;
      where.country = { is: { isActive: true } };
    }
    const cities = await prisma.city.findMany({
      where,
      orderBy: { name: "asc" },
      include: { country: true, _count: { select: { agencies: true } } },
    });
    return res.json(cities);
  } catch (error) {
    console.error("GET /cities", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, countryId, isActive } = req.body;
    if (!name?.trim() || !countryId) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    const city = await prisma.city.create({
      data: { name: name.trim(), countryId, isActive: isActive !== false },
      include: { country: true },
    });
    return res.status(201).json(city);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "DUPLICATE" });
    console.error("POST /cities", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.countryId) data.countryId = req.body.countryId;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const city = await prisma.city.update({
      where: { id: req.params.id },
      data,
      include: { country: true },
    });
    return res.json(city);
  } catch (error) {
    console.error("PATCH /cities/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const count = await prisma.agency.count({ where: { cityId: req.params.id } });
    if (count > 0) return res.status(409).json({ error: "HAS_AGENCIES" });
    await prisma.city.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /cities/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
