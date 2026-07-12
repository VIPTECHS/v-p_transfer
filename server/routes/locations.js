import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.cityId) where.cityId = req.query.cityId;
    if (req.query.districtId) where.districtId = req.query.districtId;
    if (req.query.type) where.type = req.query.type;
    if (req.query.active === "true") where.isActive = true;

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: "asc" },
      include: { city: true, district: true },
    });
    return res.json(locations);
  } catch (error) {
    console.error("GET /locations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, type, cityId, districtId, lat, lng, isActive } = req.body;
    if (!name?.trim() || !type?.trim()) return res.status(400).json({ error: "VALIDATION" });

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        cityId: cityId || null,
        districtId: districtId || null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
        isActive: isActive !== false,
      },
      include: { city: true, district: true },
    });
    return res.status(201).json(location);
  } catch (error) {
    console.error("POST /locations", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.type) data.type = req.body.type.trim();
    if (req.body.cityId !== undefined) data.cityId = req.body.cityId || null;
    if (req.body.districtId !== undefined) data.districtId = req.body.districtId || null;
    if (req.body.lat !== undefined) data.lat = req.body.lat != null ? Number(req.body.lat) : null;
    if (req.body.lng !== undefined) data.lng = req.body.lng != null ? Number(req.body.lng) : null;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const location = await prisma.location.update({
      where: { id: req.params.id },
      data,
      include: { city: true, district: true },
    });
    return res.json(location);
  } catch (error) {
    console.error("PATCH /locations/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /locations/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
