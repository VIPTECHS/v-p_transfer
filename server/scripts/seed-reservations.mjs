import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-abc-transfer" },
    update: {
      name: "ABC Transfer Company",
      isActive: true,
    },
    create: {
      id: "seed-supplier-abc-transfer",
      name: "ABC Transfer Company",
      phone: "+90 850 255 48 47",
      email: "ops@abctransfer.com",
      contactName: "Operasyon",
      isActive: true,
    },
  });

  const customer = await prisma.customer.upsert({
    where: { id: "seed-customer-emre-demo" },
    update: {
      firstName: "Emre",
      lastName: "Demo",
      email: "emre.demo@example.com",
      phone: "+905001112233",
      isActive: true,
    },
    create: {
      id: "seed-customer-emre-demo",
      firstName: "Emre",
      lastName: "Demo",
      email: "emre.demo@example.com",
      phone: "+905001112233",
      isActive: true,
    },
  });

  const existing = await prisma.reservation.findFirst({
    where: { reference: "RZV-2025-000123" },
  });

  if (existing) {
    console.log("Reservation already exists:", existing.reference);
    return;
  }

  const reservation = await prisma.reservation.create({
    data: {
      reference: "RZV-2025-000123",
      status: "confirmed",
      supplierId: supplier.id,
      supplierPrice: 120,
      supplierCurrency: "EUR",
      supplierPaymentStatus: "paid",
      supplierPaymentType: "Nakit",
      supplierPaymentDate: new Date("2025-05-25"),
      supplierNote: "Tedarikçiye 25.05.2025 tarihinde ödeme yapıldı.",
      customerId: customer.id,
      salePrice: 180,
      saleCurrency: "EUR",
      customerPaymentStatus: "paid",
      customerPaymentType: "Kredi Kartı",
      customerPaymentDate: new Date("2025-05-20"),
      customerNote: "Müşteriden kredi kartı ile ödeme alındı.",
      transfers: {
        create: [
          {
            flightCode: "TK2412",
            fromLabel: "İstanbul Havalimanı (IST)",
            toLabel: "Kemer, Antalya",
            transferDate: new Date("2025-05-25"),
            transferTime: "14:30",
            type: "arrival",
            sortOrder: 0,
          },
          {
            flightCode: "PC2001",
            fromLabel: "Kemer, Antalya",
            toLabel: "İstanbul Havalimanı (IST)",
            transferDate: new Date("2025-05-30"),
            transferTime: "10:00",
            type: "departure",
            sortOrder: 1,
          },
          {
            fromLabel: "Kemer, Antalya",
            toLabel: "Antalya Şehir Merkezi",
            transferDate: new Date("2025-05-28"),
            transferTime: "18:00",
            type: "internal",
            sortOrder: 2,
          },
        ],
      },
      passengers: {
        create: [
          { firstName: "Ahmet", lastName: "Yılmaz", identityNumber: "123******789", sortOrder: 0 },
          { firstName: "Mehmet", lastName: "Yılmaz", identityNumber: "987******654", sortOrder: 1 },
          { firstName: "Ayşe", lastName: "Yılmaz", identityNumber: "456******123", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.reservationStatusLog.create({
    data: {
      reservationId: reservation.id,
      fromStatus: null,
      toStatus: "confirmed",
      note: "Mockup örnek kaydı oluşturuldu",
    },
  });

  console.log("Created reservation:", reservation.reference);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
