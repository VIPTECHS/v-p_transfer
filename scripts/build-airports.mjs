/**
 * Builds a compact IATA/ICAO lookup from OurAirports CSV.
 * Run: node scripts/build-airports.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "scripts", "airports.csv");
const outPath = join(root, "src", "data", "airports.json");

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
}

const raw = readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).slice(1);

/** @type {Record<string, { label: string, lng: number, lat: number, iata?: string, icao?: string }>} */
const byCode = {};

for (const line of lines) {
  if (!line.trim()) continue;
  const cols = parseCsvLine(line);
  const name = cols[3];
  const lat = Number(cols[4]);
  const lng = Number(cols[5]);
  const country = cols[8];
  const city = cols[10];
  const icao = cols[12]?.trim().toUpperCase();
  const iata = cols[13]?.trim().toUpperCase();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

  const place = [city, country].filter(Boolean).join(", ");
  const entry = {
    label: iata
      ? `${name} (${iata})${place ? ` — ${place}` : ""}`
      : `${name}${place ? ` — ${place}` : ""}`,
    lng,
    lat,
    ...(iata ? { iata } : {}),
    ...(icao ? { icao } : {}),
  };

  if (iata && iata.length === 3 && !byCode[iata]) {
    byCode[iata] = entry;
  }
  if (icao && icao.length === 4 && !byCode[icao]) {
    byCode[icao] = entry;
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(byCode));
console.log(`Wrote ${Object.keys(byCode).length} airport codes to ${outPath}`);
