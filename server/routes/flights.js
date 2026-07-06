import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Hybrid flight tracking:
//  - If FLIGHT_API_KEY (RapidAPI / AeroDataBox) is configured, return live status.
//  - Otherwise respond with { configured: false } so the client falls back to a
//    "track on FlightRadar24" deep link. No key required for the app to work.
// Env is read at request time (not module load) because dotenv config() runs
// after ESM imports are evaluated.

// Small in-memory cache to protect the (limited) API quota.
const CACHE_TTL_MS = 3 * 60 * 1000;
const NEG_TTL_MS = 60 * 1000;
const cache = new Map(); // key -> { expires, payload }

function getCached(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.payload;
  if (hit) cache.delete(key);
  return null;
}

function setCached(key, payload, ttl) {
  cache.set(key, { expires: Date.now() + ttl, payload });
}

function pickTime(t) {
  if (!t) return null;
  return t.local || t.utc || null;
}

function normalizeAirport(a) {
  if (!a) return null;
  return {
    iata: a.iata || a.iataCode || null,
    icao: a.icao || null,
    name: a.name || a.shortName || null,
    city: a.municipalityName || a.city || null,
  };
}

function normalizeFlight(flight, code) {
  const dep = flight.departure || {};
  const arr = flight.arrival || {};
  return {
    flightNumber: flight.number || code,
    airline: flight.airline?.name || null,
    status: flight.status || "Unknown",
    isCancelled: /cancel/i.test(flight.status || ""),
    departure: {
      ...normalizeAirport(dep.airport),
      scheduled: pickTime(dep.scheduledTime),
      revised: pickTime(dep.revisedTime) || pickTime(dep.predictedTime) || pickTime(dep.runwayTime),
      terminal: dep.terminal || null,
      gate: dep.gate || null,
    },
    arrival: {
      ...normalizeAirport(arr.airport),
      scheduled: pickTime(arr.scheduledTime),
      revised: pickTime(arr.revisedTime) || pickTime(arr.predictedTime) || pickTime(arr.runwayTime),
      terminal: arr.terminal || null,
      gate: arr.gate || null,
      baggageBelt: arr.baggageBelt || null,
    },
  };
}

// GET /flights/:code?date=YYYY-MM-DD
router.get("/:code", requireAdmin, async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase().replace(/\s+/g, "");
  const date = String(req.query.date || "").trim();

  if (!code) return res.status(400).json({ error: "MISSING_CODE" });

  const apiKey = process.env.FLIGHT_API_KEY || "";
  const apiHost = process.env.FLIGHT_API_HOST || "aerodatabox.p.rapidapi.com";

  if (!apiKey) {
    return res.json({ configured: false });
  }

  const cacheKey = `${code}|${date}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  const datePath = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `/${date}` : "";
  const url = `https://${apiHost}/flights/number/${encodeURIComponent(code)}${datePath}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === 204 || response.status === 404) {
      const payload = { configured: true, found: false, flightNumber: code };
      setCached(cacheKey, payload, NEG_TTL_MS);
      return res.json(payload);
    }
    if (!response.ok) {
      return res.status(502).json({ configured: true, error: "UPSTREAM_ERROR" });
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data?.flights || [];
    if (!list.length) {
      const payload = { configured: true, found: false, flightNumber: code };
      setCached(cacheKey, payload, NEG_TTL_MS);
      return res.json(payload);
    }

    const payload = {
      configured: true,
      found: true,
      updatedAt: new Date().toISOString(),
      ...normalizeFlight(list[list.length - 1], code),
    };
    setCached(cacheKey, payload, CACHE_TTL_MS);
    return res.json(payload);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({ configured: true, error: "TIMEOUT" });
    }
    console.error("GET /flights/:code", error);
    return res.status(502).json({ configured: true, error: "UPSTREAM_ERROR" });
  }
});

export default router;
