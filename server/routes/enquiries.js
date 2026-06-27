import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { enquiryCreateSchema, parseBody } from "../lib/validation.js";

const router = Router();

const VALID_STATUSES = ["new", "read", "replied", "archived"];

function serializeEnquiry(enquiry) {
  return {
    ...enquiry,
    createdAt: enquiry.createdAt.toISOString(),
    updatedAt: enquiry.updatedAt.toISOString(),
  };
}

// POST /enquiries
router.post("/", async (req, res) => {
  try {
    if (req.body?.website) {
      return res.status(201).json({ success: true });
    }

    const parsed = parseBody(enquiryCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { name, email, phone, message } = parsed.data;

    const enquiry = await prisma.enquiry.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
        status: "new",
      },
    });

    return res.status(201).json({ success: true, enquiry: serializeEnquiry(enquiry) });
  } catch (error) {
    console.error("POST /enquiries", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /enquiries
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(enquiries.map(serializeEnquiry));
  } catch (error) {
    console.error("GET /enquiries", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /enquiries/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.enquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    const data = {};
    if (req.body.status && VALID_STATUSES.includes(req.body.status)) {
      data.status = req.body.status;
    }

    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data,
    });

    return res.json(serializeEnquiry(enquiry));
  } catch (error) {
    console.error("PATCH /enquiries/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
