import { fleetItems } from "../data/content.js";

const FLEET_BY_KEY = Object.fromEntries(
  fleetItems.map((item) => [item.key, item]),
);

export const FLEET_SPECS = {
  vClassStandard: { name: "V Class Standard", type: "Van", passengerCap: 6, luggageCap: 6 },
  vClassLux: { name: "V Class Lux", type: "Van", passengerCap: 6, luggageCap: 6 },
  vClassUltraLux: { name: "V Class Ultra Lux", type: "Van", passengerCap: 6, luggageCap: 5 },
  sprinterStandard: { name: "Sprinter Standard", type: "Minibüs", passengerCap: 16, luggageCap: 16 },
  sprinterUltraLux: { name: "Sprinter Ultra Lux", type: "Minibüs", passengerCap: 9, luggageCap: 9 },
  eClass: { name: "E Class", type: "Sedan", passengerCap: 3, luggageCap: 3 },
  sClass: { name: "S Class", type: "Sedan", passengerCap: 2, luggageCap: 3 },
  maybach: { name: "Maybach", type: "Sedan", passengerCap: 2, luggageCap: 3 },
};

export function resolveFleetSpec(vehicleKey) {
  if (!vehicleKey) return null;
  const raw = String(vehicleKey).trim();
  if (FLEET_SPECS[raw]) {
    return { key: raw, ...FLEET_SPECS[raw], image: FLEET_BY_KEY[raw]?.image };
  }
  const lower = raw.toLowerCase().replace(/[\s_-]/g, "");
  const match = Object.entries(FLEET_SPECS).find(([key, spec]) => {
    const keyNorm = key.toLowerCase();
    const nameNorm = spec.name.toLowerCase().replace(/[\s_-]/g, "");
    return keyNorm === lower || nameNorm === lower || nameNorm.includes(lower) || lower.includes(keyNorm);
  });
  if (!match) return { key: raw, name: raw, type: "Araç", passengerCap: 4, luggageCap: 4, image: null };
  const [key, spec] = match;
  return { key, ...spec, image: FLEET_BY_KEY[key]?.image };
}

export function capacityStatus(used, max) {
  if (used > max) return "over";
  if (used === max) return "full";
  if (used >= max * 0.75) return "high";
  return "ok";
}
