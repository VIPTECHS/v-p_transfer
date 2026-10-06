import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { partnerApplicationCreateSchema, parseBody } from "../lib/validation.js";

const router = Router();
const STATUSES = ["new", "reviewing", "approved", "rejected", "archived"];

function serialize(application) {
  return {
    ...application,
    privacyAcceptedAt: application.privacyAcceptedAt.toISOString(),
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

// Public application submission. All reading and status changes require an admin session.
router.post("/", async (req, res) => {
  try {
    if (req.body?.fax) return res.status(201).json({ success: true });

    const parsed = parseBody(partnerApplicationCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const data = parsed.data;
    const application = await prisma.partnerApplication.create({
      data: {
        companyName: data.companyName,
        website: data.website || null,
        countryCity: data.countryCity,
        contactName: data.contactName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        companyType: data.companyType,
        companyTypeOther: data.companyType === "other" ? data.companyTypeOther || null : null,
        monthlyVolume: data.monthlyVolume,
        destinations: data.destinations,
        workPreference: data.workPreference,
        workPreferenceOther: data.workPreference === "other" ? data.workPreferenceOther || null : null,
        notes: data.notes || null,
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
        status: "new",
      },
    });

    return res.status(201).json({ success: true, id: application.id });
  } catch (error) {
    console.error("POST /partner-applications", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const applications = await prisma.partnerApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return res.json(applications.map(serialize));
  } catch (error) {
    console.error("GET /partner-applications", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    if (!STATUSES.includes(req.body?.status)) {
      return res.status(400).json({ error: "INVALID_STATUS" });
    }

    const application = await prisma.partnerApplication.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    return res.json(serialize(application));
  } catch (error) {
    if (error?.code === "P2025") return res.status(404).json({ error: "NOT_FOUND" });
    console.error("PATCH /partner-applications/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
