import prisma from "./prisma.js";

function normalizeForMatch(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

const CITY_ALIASES = {
  istanbul: ["istanbul", "sabiha", "gokcen", "gökçen", "ataturk", "atatürk", "(ist)", " ist)", "ist airport"],
};

function matchesAlias(normalized, alias) {
  const a = normalizeForMatch(alias);
  if (a.length <= 4 && !a.startsWith("(")) {
    return new RegExp(`(^|[\\s,(])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\\s,)]|$)`).test(normalized);
  }
  return normalized.includes(a);
}

function matchesCity(label, cityName) {
  const normalized = normalizeForMatch(label);
  const cityNorm = normalizeForMatch(cityName);
  if (normalized.includes(cityNorm)) return true;

  const aliases = CITY_ALIASES[cityNorm];
  return aliases?.some((alias) => matchesAlias(normalized, alias)) ?? false;
}

export async function matchBookingToCity(booking) {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
  });

  const fromLabel = booking.fromLabel || "";
  const toLabel = booking.toLabel || "";

  for (const city of cities) {
    if (matchesCity(fromLabel, city.name) || matchesCity(toLabel, city.name)) {
      return { cityId: city.id };
    }
  }

  return { cityId: null };
}

export async function rematchBookingsWithoutCity() {
  const bookings = await prisma.booking.findMany({
    where: { cityId: null },
    select: { id: true, fromLabel: true, toLabel: true },
  });

  let updated = 0;
  for (const booking of bookings) {
    const match = await matchBookingToCity(booking);
    if (match.cityId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { cityId: match.cityId },
      });
      updated++;
    }
  }
  return updated;
}
