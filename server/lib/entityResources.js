import prisma from "./prisma.js";

export function serializeDocument(doc) {
  return {
    ...doc,
    issuedAt: doc.issuedAt?.toISOString() ?? null,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listBankAccounts(entityType, entityId) {
  return prisma.bankAccount.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "asc" },
  });
}

export async function listDocuments(entityType, entityId) {
  const docs = await prisma.entityDocument.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
  });
  return docs.map(serializeDocument);
}

export async function createBankAccount(entityType, entityId, body) {
  const { accountHolder, bankName, branch, iban, swift, currency, paymentTermDays } = body;
  if (!accountHolder?.trim() || !bankName?.trim() || !iban?.trim()) {
    throw new Error("VALIDATION");
  }
  return prisma.bankAccount.create({
    data: {
      entityType,
      entityId,
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      branch: branch?.trim() || null,
      iban: iban.trim(),
      swift: swift?.trim() || null,
      currency: currency || "EUR",
      paymentTermDays: paymentTermDays != null ? Number(paymentTermDays) : null,
    },
  });
}

export async function updateBankAccount(id, entityType, entityId, body) {
  const existing = await prisma.bankAccount.findFirst({ where: { id, entityType, entityId } });
  if (!existing) return null;
  const data = {};
  if (body.accountHolder) data.accountHolder = body.accountHolder.trim();
  if (body.bankName) data.bankName = body.bankName.trim();
  if (body.branch !== undefined) data.branch = body.branch?.trim() || null;
  if (body.iban) data.iban = body.iban.trim();
  if (body.swift !== undefined) data.swift = body.swift?.trim() || null;
  if (body.currency) data.currency = body.currency;
  if (body.paymentTermDays !== undefined) data.paymentTermDays = body.paymentTermDays != null ? Number(body.paymentTermDays) : null;
  return prisma.bankAccount.update({ where: { id }, data });
}

export async function deleteBankAccount(id, entityType, entityId) {
  const existing = await prisma.bankAccount.findFirst({ where: { id, entityType, entityId } });
  if (!existing) return false;
  await prisma.bankAccount.delete({ where: { id } });
  return true;
}

export async function createDocument(entityType, entityId, file, body) {
  const { docType, docNumber, issuedAt, expiresAt } = body;
  if (!docType || !file) throw new Error("VALIDATION");
  const doc = await prisma.entityDocument.create({
    data: {
      entityType,
      entityId,
      docType,
      docNumber: docNumber?.trim() || null,
      issuedAt: issuedAt ? new Date(issuedAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      filePath: `/uploads/documents/${file.filename}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
    },
  });
  return serializeDocument(doc);
}

export async function deleteDocument(id, entityType, entityId) {
  const existing = await prisma.entityDocument.findFirst({ where: { id, entityType, entityId } });
  if (!existing) return false;
  await prisma.entityDocument.delete({ where: { id } });
  return true;
}

export const SUPPLIER_PATCH_FIELDS = [
  "name", "countryId", "cityId", "districtId", "address", "phone", "whatsapp", "email", "website",
  "contactName", "contactPhone", "contactWhatsapp", "contactEmail",
  "invoiceTitle", "taxOffice", "taxNumber", "invoiceAddress", "invoiceEmail", "isActive",
];

export const AGENCY_PATCH_FIELDS = [
  ...SUPPLIER_PATCH_FIELDS,
  "commissionRate", "commissionType", "commissionCurrency", "webhookUrl",
];

export function pickPatchFields(body, fields) {
  const data = {};
  for (const key of fields) {
    if (body[key] !== undefined) {
      if (["countryId", "cityId", "districtId"].includes(key)) {
        data[key] = body[key] || null;
      } else if (key === "isActive") {
        data[key] = Boolean(body[key]);
      } else if (key === "commissionRate") {
        data[key] = body[key] != null ? Number(body[key]) : null;
      } else if (typeof body[key] === "string") {
        data[key] = body[key].trim() || null;
      } else {
        data[key] = body[key];
      }
    }
  }
  return data;
}

export const supplierInclude = {
  country: true,
  city: { include: { country: true } },
  district: true,
};

export const agencyInclude = {
  country: true,
  city: { include: { country: true } },
  district: true,
};
