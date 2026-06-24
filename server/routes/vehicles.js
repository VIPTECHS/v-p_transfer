import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { name: "asc" } });
    return res.json(vehicles);
  } catch (error) {
    console.error("GET /vehicles", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { key, name, plate, isActive } = req.body;
    if (!key?.trim() || !name?.trim()) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    const vehicle = await prisma.vehicle.create({
      data: {
        key: key.trim(),
        name: name.trim(),
        plate: plate?.trim() || null,
        isActive: isActive !== false,
      },
    });
    return res.status(201).json(vehicle);
  } catch (error) {
    console.error("POST /vehicles", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.plate !== undefined) data.plate = req.body.plate?.trim() || null;
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(vehicle);
  } catch (error) {
    console.error("PATCH /vehicles/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
