import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../prisma/.env") });

const prisma = new PrismaClient();

const fleetKeys = [
  { key: "vClassStandard", name: "Mercedes V-Class Standard" },
  { key: "vClassLux", name: "Mercedes V-Class Lux" },
  { key: "sClass", name: "Mercedes S-Class" },
  { key: "sprinterStandard", name: "Mercedes Sprinter" },
];

async function main() {
  for (const v of fleetKeys) {
    await prisma.vehicle.upsert({
      where: { key: v.key },
      update: { name: v.name },
      create: { key: v.key, name: v.name, isActive: true },
    });
  }

  const driverCount = await prisma.driver.count();
  if (driverCount === 0) {
    await prisma.driver.create({
      data: { name: "Demo Şoför", phone: "+905551234567", email: "driver@viptransfer.com", isActive: true },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
