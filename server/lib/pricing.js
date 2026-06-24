import { CURRENCY, VEHICLE_MULTIPLIERS, HOURLY_BASE, AIRPORT_ZONES, RETURN_TRANSFER_MULTIPLIER, NIGHT_SURCHARGE } from "../../src/data/pricing.js";

export { CURRENCY, VEHICLE_MULTIPLIERS, HOURLY_BASE, AIRPORT_ZONES, RETURN_TRANSFER_MULTIPLIER, NIGHT_SURCHARGE };

const AIRPORT_KEYWORDS = ["airport", "havaliman", "sabiha", "istanbul airport", " (ist)", " (saw)"];

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
  if (t.includes("sultanahmet")) return "sultanahmet";
  if (t.includes("besiktas") || t.includes("beşiktaş")) return "besiktas";
  if (t.includes("kadikoy") || t.includes("kadıköy")) return "kadikoy";
  return "default";
}

function isNightPickup(pickupAt) {
  const d = new Date(pickupAt);
  const h = d.getHours();
  return h >= 22 || h < 6;
}

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
