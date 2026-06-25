import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { cities: true } } },
    });
    const priority = ["TR", "CY-N"];
    countries.sort((a, b) => {
      const ai = priority.indexOf(a.code);
      const bi = priority.indexOf(b.code);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    return res.json(countries);
  } catch (error) {
    console.error("GET /countries", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    if (!name?.trim() || !code?.trim()) {
      return res.status(400).json({ error: "VALIDATION" });
    }
    const country = await prisma.country.create({
      data: { name: name.trim(), code: code.trim().toUpperCase(), isActive: isActive !== false },
    });
    return res.status(201).json(country);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "DUPLICATE" });
    console.error("POST /countries", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.code) data.code = req.body.code.trim().toUpperCase();
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);

    const country = await prisma.country.update({ where: { id: req.params.id }, data });
    return res.json(country);
  } catch (error) {
    console.error("PATCH /countries/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const count = await prisma.city.count({ where: { countryId: req.params.id } });
    if (count > 0) return res.status(409).json({ error: "HAS_CITIES" });
    await prisma.country.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /countries/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
