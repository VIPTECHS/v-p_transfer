import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import bookingsRouter from "./routes/bookings.js";
import enquiriesRouter from "./routes/enquiries.js";
import statsRouter from "./routes/stats.js";
import driversRouter from "./routes/drivers.js";
import vehiclesRouter from "./routes/vehicles.js";
import operationsRouter from "./routes/operations.js";
import authRouter from "./routes/auth.js";
import countriesRouter from "./routes/countries.js";
import citiesRouter from "./routes/cities.js";
import agenciesRouter from "./routes/agencies.js";
import agencyPanelRouter from "./routes/agency-panel.js";
import { rematchBookingsWithoutCity } from "./lib/cityMatcher.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { requireAdmin, requireAuth, requireRole, validateAuthEnv } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "prisma", ".env") });

const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

try {
  validateAuthEnv();
} catch (error) {
  console.error("Auth configuration error:", error.message);
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);

const corsOrigins = (process.env.CORS_ORIGIN || "https://viptransfer.com")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!isProd) {
  corsOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://*.openstreetmap.org", "https://tiles.openfreemap.org", "https://*.openfreemap.org"],
            mediaSrc: ["'self'", "blob:"],
            frameSrc: ["'none'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS_NOT_ALLOWED"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(rateLimit);

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.use("/auth", authRouter);
app.use("/bookings", bookingsRouter);
app.use("/enquiries", enquiriesRouter);
app.use("/stats", requireAdmin, statsRouter);
app.use("/drivers", driversRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/operations", operationsRouter);
app.use("/countries", requireAdmin, countriesRouter);
app.use("/cities", requireAdmin, citiesRouter);
app.use("/agencies", requireAdmin, agenciesRouter);
app.use("/agency", requireAuth, requireRole("agency"), agencyPanelRouter);

// Production: frontend sends /api/* — rewrite to match routes above
app.use("/api", (req, _res, next) => {
  req.url = req.originalUrl.replace(/^\/api/, "");
  next("route");
});
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/stats", requireAdmin, statsRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/operations", operationsRouter);
app.use("/api/countries", requireAdmin, countriesRouter);
app.use("/api/cities", requireAdmin, citiesRouter);
app.use("/api/agencies", requireAdmin, agenciesRouter);
app.use("/api/agency", requireAuth, requireRole("agency"), agencyPanelRouter);

function resolvePrerenderedHtml(distPath, urlPath) {
  const normalized = urlPath.replace(/\/$/, "") || "/";
  if (normalized === "/") {
    return path.join(distPath, "index.html");
  }
  const segments = normalized.replace(/^\//, "");
  return path.join(distPath, segments, "index.html");
}

function send404(res) {
  res.status(404).type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>404 — VIP Transfer</title></head>
<body style="font-family:sans-serif;text-align:center;padding:4rem;background:#f2efe8;color:#1a1a2e">
<h1>404</h1><p>Page not found.</p><a href="/">Back to home</a>
</body></html>`);
}

// Production: serve built frontend
if (isProd) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath, { fallthrough: true }));

  app.get("/{*splat}", (req, res) => {
    const urlPath = req.path;

    // Client-only admin SPA (not prerendered)
    if (urlPath.startsWith("/admin")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }

    const htmlPath = resolvePrerenderedHtml(distPath, urlPath);
    if (existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }

    return send404(res);
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

app.use((err, _req, res, _next) => {
  if (err?.message === "CORS_NOT_ALLOWED") {
    return res.status(403).json({ error: "CORS_FORBIDDEN" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "SERVER_ERROR" });
});

app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Database: ${path.join(__dirname, "prisma", "dev.db")}`);
  try {
    const matched = await rematchBookingsWithoutCity();
    if (matched > 0) console.log(`City matcher: ${matched} booking(s) linked to cities`);
  } catch (err) {
    console.error("City matcher startup error:", err);
  }
});
