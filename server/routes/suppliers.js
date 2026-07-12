import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { supplierCreateSchema, parseBody } from "../lib/validation.js";
import { documentUpload } from "../lib/upload.js";
import {
  pickPatchFields,
  SUPPLIER_PATCH_FIELDS,
  supplierInclude,
  listBankAccounts,
  listDocuments,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  createDocument,
  deleteDocument,
} from "../lib/entityResources.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { q, cityId } = req.query;
    const where = {};
    if (cityId) where.cityId = cityId;
    if (q?.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
        { contactName: { contains: term } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: { ...supplierInclude, _count: { select: { reservations: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(suppliers);
  } catch (error) {
    console.error("GET /suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: supplierInclude,
    });
    if (!supplier) return res.status(404).json({ error: "NOT_FOUND" });
    const [bankAccounts, documents] = await Promise.all([
      listBankAccounts("supplier", req.params.id),
      listDocuments("supplier", req.params.id),
    ]);
    return res.json({ ...supplier, bankAccounts, documents });
  } catch (error) {
    console.error("GET /suppliers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = parseBody(supplierCreateSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const supplier = await prisma.supplier.create({
      data: parsed.data,
      include: supplierInclude,
    });
    return res.status(201).json(supplier);
  } catch (error) {
    console.error("POST /suppliers", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });

    const data = pickPatchFields(req.body, SUPPLIER_PATCH_FIELDS);
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data,
      include: supplierInclude,
    });
    return res.json(supplier);
  } catch (error) {
    console.error("PATCH /suppliers/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id/bank-accounts", requireAdmin, async (req, res) => {
  try {
    const accounts = await listBankAccounts("supplier", req.params.id);
    return res.json(accounts);
  } catch (error) {
    console.error("GET /suppliers/:id/bank-accounts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/bank-accounts", requireAdmin, async (req, res) => {
  try {
    const account = await createBankAccount("supplier", req.params.id, req.body);
    return res.status(201).json(account);
  } catch (error) {
    if (error.message === "VALIDATION") return res.status(400).json({ error: "VALIDATION" });
    console.error("POST /suppliers/:id/bank-accounts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id/bank-accounts/:accountId", requireAdmin, async (req, res) => {
  try {
    const account = await updateBankAccount(req.params.accountId, "supplier", req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(account);
  } catch (error) {
    console.error("PATCH bank-account", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id/bank-accounts/:accountId", requireAdmin, async (req, res) => {
  try {
    const ok = await deleteBankAccount(req.params.accountId, "supplier", req.params.id);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE bank-account", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id/documents", requireAdmin, async (req, res) => {
  try {
    return res.json(await listDocuments("supplier", req.params.id));
  } catch (error) {
    console.error("GET /suppliers/:id/documents", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/:id/documents", requireAdmin, documentUpload.single("file"), async (req, res) => {
  try {
    const doc = await createDocument("supplier", req.params.id, req.file, req.body);
    return res.status(201).json(doc);
  } catch (error) {
    if (error.message === "VALIDATION") return res.status(400).json({ error: "VALIDATION" });
    console.error("POST /suppliers/:id/documents", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id/documents/:docId", requireAdmin, async (req, res) => {
  try {
    const ok = await deleteDocument(req.params.docId, "supplier", req.params.id);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE document", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
