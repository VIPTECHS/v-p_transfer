import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { documentUpload } from "../lib/upload.js";
import {
  pickPatchFields,
  AGENCY_PATCH_FIELDS,
  agencyInclude,
  listBankAccounts,
  listDocuments,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  createDocument,
  deleteDocument,
} from "../lib/entityResources.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.cityId) where.cityId = req.query.cityId;
    const agencies = await prisma.agency.findMany({
      where,
      orderBy: { name: "asc" },
      include: agencyInclude,
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
      include: agencyInclude,
    });
    if (!agency) return res.status(404).json({ error: "NOT_FOUND" });
    const { passwordHash, ...safe } = agency;
    const [bankAccounts, documents] = await Promise.all([
      listBankAccounts("agency", req.params.id),
      listDocuments("agency", req.params.id),
    ]);
    return res.json({ ...safe, bankAccounts, documents });
  } catch (error) {
    console.error("GET /agencies/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id/reservations", async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { agencyId: req.params.id },
      include: {
        customer: true,
        supplier: true,
        transfers: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { transfers: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(
      reservations.map((r) => ({
        ...r,
        supplierPaymentDate: r.supplierPaymentDate?.toISOString() ?? null,
        customerPaymentDate: r.customerPaymentDate?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        firstTransferDate: r.transfers[0]?.transferDate?.toISOString() ?? null,
      })),
    );
  } catch (error) {
    console.error("GET /agencies/:id/reservations", error);
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
      include: agencyInclude,
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
    const data = pickPatchFields(req.body, AGENCY_PATCH_FIELDS);
    const agency = await prisma.agency.update({
      where: { id: req.params.id },
      data,
      include: agencyInclude,
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

router.get("/:id/bank-accounts", async (req, res) => {
  try {
    return res.json(await listBankAccounts("agency", req.params.id));
  } catch (error) {
    console.error("GET /agencies/:id/bank-accounts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/bank-accounts", async (req, res) => {
  try {
    const account = await createBankAccount("agency", req.params.id, req.body);
    return res.status(201).json(account);
  } catch (error) {
    if (error.message === "VALIDATION") return res.status(400).json({ error: "VALIDATION" });
    console.error("POST /agencies/:id/bank-accounts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id/bank-accounts/:accountId", async (req, res) => {
  try {
    const account = await updateBankAccount(req.params.accountId, "agency", req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(account);
  } catch (error) {
    console.error("PATCH agency bank-account", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id/bank-accounts/:accountId", async (req, res) => {
  try {
    const ok = await deleteBankAccount(req.params.accountId, "agency", req.params.id);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE agency bank-account", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id/documents", async (req, res) => {
  try {
    return res.json(await listDocuments("agency", req.params.id));
  } catch (error) {
    console.error("GET /agencies/:id/documents", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/documents", documentUpload.single("file"), async (req, res) => {
  try {
    const doc = await createDocument("agency", req.params.id, req.file, req.body);
    return res.status(201).json(doc);
  } catch (error) {
    if (error.message === "VALIDATION") return res.status(400).json({ error: "VALIDATION" });
    console.error("POST /agencies/:id/documents", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id/documents/:docId", async (req, res) => {
  try {
    const ok = await deleteDocument(req.params.docId, "agency", req.params.id);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE agency document", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
