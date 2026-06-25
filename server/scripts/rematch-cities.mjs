import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { matchBookingToCity } from "../lib/cityMatcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../prisma/.env") });

const prisma = new PrismaClient();
const rematchAll = process.argv.includes("--all");

const bookings = await prisma.booking.findMany({
  where: rematchAll ? undefined : { cityId: null },
  select: { id: true, fromLabel: true, toLabel: true, reference: true, cityId: true },
});

let updated = 0;
for (const booking of bookings) {
  const match = await matchBookingToCity(booking);
  if (match.cityId !== booking.cityId) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { cityId: match.cityId },
    });
    updated++;
    console.log(`✓ ${booking.reference} -> ${match.cityId || "null"}`);
  }
}

console.log(`\nDone: ${updated}/${bookings.length} bookings updated.`);
await prisma.$disconnect();
