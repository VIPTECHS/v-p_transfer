import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import cors from "cors";
import express from "express";
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
import { requireAdmin, requireAuth, requireRole } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "prisma", ".env") });

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
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

// Production: serve built frontend
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

app.use((err, _req, res, _next) => {
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
