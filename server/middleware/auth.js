/**
 * Simple admin auth: Bearer token or X-Admin-Password header.
 * If neither env is set, admin routes are open (dev mode).
 */
export function requireAdmin(req, res, next) {
  // Read at request time. The server loads its dotenv file after ESM imports
  // are evaluated, so module-level constants would permanently capture empty
  // values and leave configured admin routes unprotected.
  const adminToken = process.env.ADMIN_API_TOKEN || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminToken && !adminPassword) {
    return next();
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const password = req.headers["x-admin-password"];

  if (adminToken && bearer === adminToken) return next();
  if (adminPassword && password === adminPassword) return next();

  return res.status(401).json({ error: "UNAUTHORIZED" });
}

export function verifyAdminPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminPassword) return true;
  return password === adminPassword;
}
