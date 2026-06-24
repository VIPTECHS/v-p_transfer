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
import { rateLimit } from "./middleware/rateLimit.js";
import { requireAdmin } from "./middleware/auth.js";

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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Database: ${path.join(__dirname, "prisma", "dev.db")}`);
});
