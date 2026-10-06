import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { parseBody, transporterApplicationCreateSchema } from "../lib/validation.js";

const router = Router();
const STATUSES = ["new", "reviewing", "approved", "rejected", "archived"];

function serialize(application) {
  return {
    ...application,
    vehicleTypes: JSON.parse(application.vehicleTypes),
    privacyAcceptedAt: application.privacyAcceptedAt.toISOString(),
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

router.post("/", async (req, res) => {
  try {
    if (req.body?.fax) return res.status(201).json({ success: true });

    const parsed = parseBody(transporterApplicationCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const data = parsed.data;
    const application = await prisma.transporterApplication.create({
      data: {
        companyName: data.companyName,
        onlinePresence: data.onlinePresence || null,
        countryCity: data.countryCity,
        contactName: data.contactName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        serviceRegions: data.serviceRegions,
        vehicleTypes: JSON.stringify(data.vehicleTypes),
        vehicleCount: data.vehicleCount,
        offers24h: data.offers24h,
        offersFixedB2bPrice: data.offersFixedB2bPrice,
        notes: data.notes || null,
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
        status: "new",
      },
    });

    return res.status(201).json({ success: true, id: application.id });
  } catch (error) {
    console.error("POST /transporter-applications", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const applications = await prisma.transporterApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return res.json(applications.map(serialize));
  } catch (error) {
    console.error("GET /transporter-applications", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    if (!STATUSES.includes(req.body?.status)) {
      return res.status(400).json({ error: "INVALID_STATUS" });
    }

    const application = await prisma.transporterApplication.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    return res.json(serialize(application));
  } catch (error) {
    if (error?.code === "P2025") return res.status(404).json({ error: "NOT_FOUND" });
    console.error("PATCH /transporter-applications/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
