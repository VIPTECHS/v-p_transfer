import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.cityId) where.cityId = req.query.cityId;
    if (req.query.active === "true") where.isActive = true;

    const districts = await prisma.district.findMany({
      where,
      orderBy: { name: "asc" },
      include: { city: { include: { country: true } } },
    });
    return res.json(districts);
  } catch (error) {
    console.error("GET /districts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, cityId, isActive } = req.body;
    if (!name?.trim() || !cityId) return res.status(400).json({ error: "VALIDATION" });

    const district = await prisma.district.create({
      data: { name: name.trim(), cityId, isActive: isActive !== false },
      include: { city: { include: { country: true } } },
    });
    return res.status(201).json(district);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "DUPLICATE" });
    console.error("POST /districts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.cityId) data.cityId = req.body.cityId;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const district = await prisma.district.update({
      where: { id: req.params.id },
      data,
      include: { city: { include: { country: true } } },
    });
    return res.json(district);
  } catch (error) {
    console.error("PATCH /districts/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.district.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /districts/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
