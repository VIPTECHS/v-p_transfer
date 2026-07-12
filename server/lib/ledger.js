import prisma from "./prisma.js";

function calcAgencyCommission(reservation, agency) {
  if (!agency || !reservation.salePrice) return 0;
  if (agency.commissionType === "fixed") return agency.commissionRate || 0;
  const rate = agency.commissionRate || 0;
  return (reservation.salePrice * rate) / 100;
}

export async function syncReservationLedger(reservationId) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { agency: true },
  });
  if (!reservation) return;

  await prisma.ledgerEntry.deleteMany({
    where: { reservationId, type: { in: ["receivable", "payable", "payment"] } },
  });

  const entryDate = reservation.createdAt;
  const entries = [];

  if (reservation.customerId && reservation.salePrice) {
    entries.push({
      entityType: "customer",
      entityId: reservation.customerId,
      reservationId,
      type: "receivable",
      direction: "debit",
      amount: reservation.salePrice,
      currency: reservation.saleCurrency,
      description: `Rezervasyon #${reservation.reference}`,
      entryDate,
    });
    if (reservation.customerPaymentStatus === "paid") {
      entries.push({
        entityType: "customer",
        entityId: reservation.customerId,
        reservationId,
        type: "payment",
        direction: "credit",
        amount: reservation.salePrice,
        currency: reservation.saleCurrency,
        description: `Ödeme — #${reservation.reference}`,
        entryDate: reservation.customerPaymentDate || entryDate,
      });
    }
  }

  if (reservation.supplierId && reservation.supplierPrice) {
    entries.push({
      entityType: "supplier",
      entityId: reservation.supplierId,
      reservationId,
      type: "payable",
      direction: "credit",
      amount: reservation.supplierPrice,
      currency: reservation.supplierCurrency,
      description: `Rezervasyon #${reservation.reference}`,
      entryDate,
    });
    if (reservation.supplierPaymentStatus === "paid") {
      entries.push({
        entityType: "supplier",
        entityId: reservation.supplierId,
        reservationId,
        type: "payment",
        direction: "debit",
        amount: reservation.supplierPrice,
        currency: reservation.supplierCurrency,
        description: `Ödeme — #${reservation.reference}`,
        entryDate: reservation.supplierPaymentDate || entryDate,
      });
    }
  }

  if (reservation.agencyId) {
    const commission = calcAgencyCommission(reservation, reservation.agency);
    if (commission > 0) {
      entries.push({
        entityType: "agency",
        entityId: reservation.agencyId,
        reservationId,
        type: "payable",
        direction: "credit",
        amount: commission,
        currency: reservation.agency?.commissionCurrency || reservation.saleCurrency,
        description: `Komisyon — #${reservation.reference}`,
        entryDate,
      });
    }
  }

  if (entries.length) {
    await prisma.ledgerEntry.createMany({ data: entries });
  }
}

export async function getLedgerSummary(entityType, entityId) {
  const entries = await prisma.ledgerEntry.findMany({
    where: { entityType, entityId },
    orderBy: { entryDate: "desc" },
  });

  let totalDebit = 0;
  let totalCredit = 0;
  let currency = "EUR";
  let lastPaymentDate = null;

  for (const e of entries) {
    currency = e.currency || currency;
    if (e.direction === "debit") totalDebit += e.amount;
    else totalCredit += e.amount;
    if (e.type === "payment") {
      const d = e.entryDate;
      if (!lastPaymentDate || d > lastPaymentDate) lastPaymentDate = d;
    }
  }

  const balance = totalDebit - totalCredit;
  const totalReceivable = entityType === "customer" ? Math.max(balance, 0) : 0;
  const totalPayable = entityType !== "customer" ? Math.max(-balance, 0) : 0;
  const pending = Math.abs(balance);

  return {
    entityType,
    entityId,
    currency,
    totalDebit,
    totalCredit,
    balance,
    totalReceivable,
    totalPayable,
    pending,
    lastPaymentDate: lastPaymentDate?.toISOString() ?? null,
    entries: entries.map((e) => ({
      ...e,
      entryDate: e.entryDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function getEntityPaymentSummaries(entityType) {
  const entities =
    entityType === "customer"
      ? await prisma.customer.findMany({ where: { isActive: true }, orderBy: { firstName: "asc" } })
      : entityType === "supplier"
        ? await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
        : await prisma.agency.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  const summaries = await Promise.all(
    entities.map(async (entity) => {
      const summary = await getLedgerSummary(entityType, entity.id);
      const name =
        entityType === "customer"
          ? `${entity.firstName} ${entity.lastName || ""}`.trim()
          : entity.name;
      return { id: entity.id, name, ...summary };
    }),
  );

  const aggregate = summaries.reduce(
    (acc, s) => {
      acc.totalReceivable += s.totalReceivable;
      acc.totalPayable += s.totalPayable;
      acc.pending += s.pending;
      if (s.lastPaymentDate && (!acc.lastPaymentDate || s.lastPaymentDate > acc.lastPaymentDate)) {
        acc.lastPaymentDate = s.lastPaymentDate;
      }
      return acc;
    },
    { totalReceivable: 0, totalPayable: 0, pending: 0, lastPaymentDate: null, currency: "EUR" },
  );

  return { summary: aggregate, entities: summaries };
}
