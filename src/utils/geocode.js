const NOMINATIM = "https://nominatim.openstreetmap.org";

/** @type {Record<string, { label: string, lng: number, lat: number, iata?: string, icao?: string }> | null} */
let airportDbPromise = null;

function langCode(lang) {
  if (lang === "tr") return "tr";
  if (lang === "de") return "de";
  return "en";
}

function loadAirportDb() {
  if (!airportDbPromise) {
    airportDbPromise = import("../data/airports.json").then((mod) => mod.default);
  }
  return airportDbPromise;
}

/** @param {string} query */
function extractAirportCodes(query) {
  const trimmed = query.trim();
  const codes = new Set();

  const exact = trimmed.match(/^([A-Za-z]{3,4})$/);
  if (exact) codes.add(exact[1].toUpperCase());

  const prefix = trimmed.match(/^([A-Za-z]{3,4})(?:\s|$)/);
  if (prefix) codes.add(prefix[1].toUpperCase());

  return [...codes];
}

/**
 * @param {string[]} codes
 * @returns {Promise<import('./geocode').SearchResult[]>}
 */
async function lookupAirportCodes(codes) {
  if (!codes.length) return [];
  const db = await loadAirportDb();
  return codes
    .map((code) => db[code])
    .filter(Boolean)
    .map((entry) => ({
      label: entry.label,
      lng: entry.lng,
      lat: entry.lat,
      kind: "airport",
    }));
}

function formatLabel(displayName) {
  return displayName?.split(",").slice(0, 4).join(", ") || displayName;
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function reverseGeocode(lng, lat, lang) {
  try {
    const response = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${langCode(lang)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) throw new Error("geocode failed");
    const data = await response.json();
    return formatLabel(data.display_name) || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/** @typedef {{ label: string, lng: number, lat: number, kind?: 'airport' | 'place' }} SearchResult */

/**
 * @param {string} query
 * @param {string} lang
 * @returns {Promise<SearchResult[]>}
 */
export async function searchPlaces(query, lang) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const airportCodes = extractAirportCodes(trimmed);
  const airportLookup = airportCodes.length
    ? lookupAirportCodes(airportCodes)
    : Promise.resolve([]);

  const nominatimQuery =
    airportCodes.length === 1 && trimmed.toUpperCase() === airportCodes[0]
      ? `${airportCodes[0]} airport`
      : trimmed;

  const params = new URLSearchParams({
    format: "json",
    q: nominatimQuery,
    limit: "8",
    "accept-language": langCode(lang),
    addressdetails: "0",
  });

  const nominatimRequest = fetch(`${NOMINATIM}/search?${params}`, {
    headers: { Accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error("search failed");
    const data = await response.json();
    return data.map((item) => ({
      label: formatLabel(item.display_name),
      lng: Number(item.lon),
      lat: Number(item.lat),
      kind: "place",
    }));
  });

  const [airports, places] = await Promise.all([airportLookup, nominatimRequest]);
  return dedupeResults([...airports, ...places]).slice(0, 10);
}
