/** Base prices in EUR — adjust per business rules */
export const CURRENCY = "EUR";

export const VEHICLE_MULTIPLIERS = {
  vClassStandard: 1,
  vClassLux: 1.15,
  vClassUltraLux: 1.35,
  sprinterStandard: 1.25,
  sprinterUltraLux: 1.5,
  eClass: 1.1,
  sClass: 1.4,
  maybach: 1.6,
};

export const HOURLY_BASE = {
  vClassStandard: 65,
  vClassLux: 75,
  vClassUltraLux: 90,
  sprinterStandard: 85,
  sprinterUltraLux: 110,
  eClass: 70,
  sClass: 95,
  maybach: 120,
};

/** Fixed airport zone prices (from airport to zone) */
export const AIRPORT_ZONES = {
  IST: {
    taksim: 55,
    sultanahmet: 60,
    besiktas: 58,
    kadikoy: 65,
    default: 70,
  },
  SAW: {
    taksim: 75,
    sultanahmet: 80,
    kadikoy: 55,
    default: 85,
  },
};

export const NIGHT_SURCHARGE = 0.15;
export const RETURN_TRANSFER_MULTIPLIER = 1.85;

const AIRPORT_KEYWORDS = [
  "airport", "havaliman", "havalimanı", "ist ", "saw ", "ayt ", "esb ",
  "istanbul airport", "sabiha", "ataturk",
];

export function isAirportTransfer(from, to) {
  const text = `${from || ""} ${to || ""}`.toLowerCase();
  return AIRPORT_KEYWORDS.some((k) => text.includes(k));
}

function detectAirport(label) {
  const t = (label || "").toLowerCase();
  if (t.includes("sabiha") || t.includes("saw")) return "SAW";
  if (t.includes("istanbul") && t.includes("airport")) return "IST";
  if (t.includes("ist")) return "IST";
  return null;
}

function detectZone(label) {
  const t = (label || "").toLowerCase();
  if (t.includes("taksim")) return "taksim";
  if (t.includes("sultanahmet") || t.includes("old city")) return "sultanahmet";
  if (t.includes("besiktas") || t.includes("beşiktaş")) return "besiktas";
  if (t.includes("kadikoy") || t.includes("kadıköy")) return "kadikoy";
  return "default";
}

function isNightPickup(pickupAt) {
  const d = new Date(pickupAt);
  const h = d.getHours();
  return h >= 22 || h < 6;
}

/**
 * @param {{ type: string, pickupAt: string, from?: string, to?: string, durationHours?: number, returnTransfer?: boolean }} trip
 * @param {string} vehicleKey
 */
export function calculateQuote(trip, vehicleKey) {
  const mult = VEHICLE_MULTIPLIERS[vehicleKey] ?? 1;
  let base = 0;
  let note = "";

  if (trip.type === "hourly") {
    const hourly = HOURLY_BASE[vehicleKey] ?? 65;
    const hours = trip.durationHours || 4;
    base = hourly * hours;
    note = `${hours}h hourly`;
  } else {
    const airport = detectAirport(trip.from) || detectAirport(trip.to);
    if (airport) {
      const zone = detectZone(trip.from) !== "default" ? detectZone(trip.from) : detectZone(trip.to);
      const zonePrices = AIRPORT_ZONES[airport] || AIRPORT_ZONES.IST;
      base = zonePrices[zone] ?? zonePrices.default;
      note = `${airport} airport zone`;
    } else {
      base = 90;
      note = "intercity estimate";
    }
  }

  let price = base * mult;
  if (isNightPickup(trip.pickupAt)) {
    price *= 1 + NIGHT_SURCHARGE;
    note += " + night";
  }
  if (trip.returnTransfer) {
    price *= RETURN_TRANSFER_MULTIPLIER;
    note += " + return";
  }

  return {
    amount: Math.round(price),
    currency: CURRENCY,
    note,
    isEstimate: !detectAirport(trip.from) && !detectAirport(trip.to) && trip.type !== "hourly",
  };
}

export function formatPrice(amount, currency = CURRENCY) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
