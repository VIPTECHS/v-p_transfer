import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "viptransfer-dev-secret";
}

export function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_API_TOKEN || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminToken && !adminPassword) {
    req.userRole = "admin";
    return next();
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const password = req.headers["x-admin-password"];

  if (adminToken && bearer === adminToken) { req.userRole = "admin"; return next(); }
  if (adminPassword && password === adminPassword) { req.userRole = "admin"; return next(); }

  return res.status(401).json({ error: "UNAUTHORIZED" });
}

export function requireAuth(req, res, next) {
  const adminToken = process.env.ADMIN_API_TOKEN || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const password = req.headers["x-admin-password"];
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  // Check JWT (agency) token first — before admin fallback
  if (bearer) {
    try {
      const payload = jwt.verify(bearer, getJwtSecret());
      if (payload.role === "agency") {
        req.userRole = "agency";
        req.agencyId = payload.agencyId;
        req.agencyCityId = payload.cityId;
        return next();
      }
    } catch {
      // invalid JWT, fall through to admin checks
    }
  }

  if (adminToken && bearer === adminToken) {
    req.userRole = "admin";
    return next();
  }
  if (adminPassword && password === adminPassword) {
    req.userRole = "admin";
    return next();
  }
  if (!adminToken && !adminPassword) {
    req.userRole = "admin";
    return next();
  }

  return res.status(401).json({ error: "UNAUTHORIZED" });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  };
}

export function verifyAdminPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminPassword) return true;
  return password === adminPassword;
}

export function signAgencyToken(agency) {
  return jwt.sign(
    { role: "agency", agencyId: agency.id, cityId: agency.cityId, name: agency.name },
    getJwtSecret(),
    { expiresIn: "24h" },
  );
}
