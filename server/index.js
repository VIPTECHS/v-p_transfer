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
import reservationsRouter from "./routes/reservations.js";
import customersRouter from "./routes/customers.js";
import suppliersRouter from "./routes/suppliers.js";
import paymentsRouter from "./routes/payments.js";
import reportsRouter from "./routes/reports.js";
import flightsRouter from "./routes/flights.js";
import { rematchBookingsWithoutCity } from "./lib/cityMatcher.js";
import { ensureMigrations } from "./lib/ensureMigrations.js";
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

try {
  ensureMigrations();
} catch (error) {
  console.error("Database migration error:", error);
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);

const corsOrigins = (process.env.CORS_ORIGIN || "https://viptransfer.com")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!isProd) {
  corsOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  );
}

if (process.env.RENDER_EXTERNAL_URL) {
  corsOrigins.push(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ""));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  // Render preview: static site + API on different *.onrender.com hosts
  if (isProd && /^https:\/\/[\w-]+\.onrender\.com$/.test(origin)) return true;
  return false;
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
      if (isAllowedOrigin(origin)) {
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

function mountRoutes(basePath, router, ...middleware) {
  const stack = middleware.length ? [...middleware, router] : [router];
  app.use(basePath, ...stack);
  if (basePath !== "/api") {
    app.use(`/api${basePath}`, ...stack);
  }
}

mountRoutes("/auth", authRouter);
mountRoutes("/bookings", bookingsRouter);
mountRoutes("/enquiries", enquiriesRouter);
mountRoutes("/stats", statsRouter, requireAdmin);
mountRoutes("/drivers", driversRouter);
mountRoutes("/vehicles", vehiclesRouter);
mountRoutes("/operations", operationsRouter);
mountRoutes("/countries", countriesRouter, requireAdmin);
mountRoutes("/cities", citiesRouter, requireAdmin);
mountRoutes("/agencies", agenciesRouter, requireAdmin);
mountRoutes("/agency", agencyPanelRouter, requireAuth, requireRole("agency"));
mountRoutes("/reservations", reservationsRouter);
mountRoutes("/customers", customersRouter);
mountRoutes("/suppliers", suppliersRouter);
mountRoutes("/payments", paymentsRouter, requireAdmin);
mountRoutes("/reports", reportsRouter, requireAdmin);
mountRoutes("/flights", flightsRouter);

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

// Production (or built dist present): serve frontend + SPA fallback for /admin
const distPath = path.join(__dirname, "..", "dist");
const serveFrontend = isProd || existsSync(distPath);

if (serveFrontend && existsSync(distPath)) {
  app.use(express.static(distPath, { fallthrough: true, index: false }));

  app.get("/{*splat}", (req, res, next) => {
    const urlPath = req.path;

    // Skip API routes — they are handled by mounted routers above
    if (urlPath.startsWith("/api")) return next();

    // Client-only admin SPA (not prerendered)
    if (urlPath.startsWith("/admin")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }

    const htmlPath = resolvePrerenderedHtml(distPath, urlPath);
    if (existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }

    // Unknown path: still boot the SPA (deep links, client routes)
    if (!path.extname(urlPath)) {
      return res.sendFile(path.join(distPath, "index.html"));
    }

    return next();
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
  console.log(`Database: ${process.env.DATABASE_URL || "file:./dev.db (default)"}`);
  try {
    const matched = await rematchBookingsWithoutCity();
    if (matched > 0) console.log(`City matcher: ${matched} booking(s) linked to cities`);
  } catch (err) {
    console.error("City matcher startup error:", err);
  }
});
