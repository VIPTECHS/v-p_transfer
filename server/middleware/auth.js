import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProd) {
      throw new Error("JWT_SECRET is required in production");
    }
    return "viptransfer-dev-secret";
  }
  return secret;
}

export function validateAuthEnv() {
  if (!isProd) return;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in production");
  }

  const hasAdminAuth =
    Boolean(process.env.ADMIN_PASSWORD_HASH) ||
    Boolean(process.env.ADMIN_PASSWORD) ||
    Boolean(process.env.ADMIN_API_TOKEN);

  if (!hasAdminAuth) {
    throw new Error(
      "Production requires ADMIN_PASSWORD_HASH, ADMIN_PASSWORD, or ADMIN_API_TOKEN",
    );
  }
}

function parseBearer(req) {
  return req.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
}

function verifyJwtRole(bearer, role) {
  if (!bearer) return null;
  try {
    const payload = jwt.verify(bearer, getJwtSecret());
    if (payload.role === role) return payload;
  } catch {
    // invalid token
  }
  return null;
}

function allowDevOpenAdmin() {
  return (
    !isProd &&
    !process.env.ADMIN_API_TOKEN &&
    !process.env.ADMIN_PASSWORD_HASH &&
    !process.env.ADMIN_PASSWORD
  );
}

export function requireAdmin(req, res, next) {
  const bearer = parseBearer(req);
  const adminToken = process.env.ADMIN_API_TOKEN || "";

  if (verifyJwtRole(bearer, "admin")) {
    req.userRole = "admin";
    return next();
  }

  if (adminToken && bearer === adminToken) {
    req.userRole = "admin";
    return next();
  }

  if (allowDevOpenAdmin()) {
    req.userRole = "admin";
    return next();
  }

  return res.status(401).json({ error: "UNAUTHORIZED" });
}

export function requireAuth(req, res, next) {
  const bearer = parseBearer(req);
  const adminToken = process.env.ADMIN_API_TOKEN || "";

  const agencyPayload = verifyJwtRole(bearer, "agency");
  if (agencyPayload) {
    req.userRole = "agency";
    req.agencyId = agencyPayload.agencyId;
    req.agencyCityId = agencyPayload.cityId;
    return next();
  }

  if (verifyJwtRole(bearer, "admin")) {
    req.userRole = "admin";
    return next();
  }

  if (adminToken && bearer === adminToken) {
    req.userRole = "admin";
    return next();
  }

  if (allowDevOpenAdmin()) {
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

export async function verifyAdminPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  const plain = process.env.ADMIN_PASSWORD || "";

  if (hash) {
    return bcrypt.compare(password || "", hash);
  }

  if (plain) {
    return password === plain;
  }

  if (!isProd) return true;
  return false;
}

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, getJwtSecret(), { expiresIn: "8h" });
}

export function signAgencyToken(agency) {
  return jwt.sign(
    { role: "agency", agencyId: agency.id, cityId: agency.cityId, name: agency.name },
    getJwtSecret(),
    { expiresIn: "24h" },
  );
}
