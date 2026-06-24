const windowMs = 60 * 1000;
const maxRequests = 120;
const hits = new Map();

export function rateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = hits.get(key) || { count: 0, reset: now + windowMs };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }

  entry.count += 1;
  hits.set(key, entry);

  if (entry.count > maxRequests) {
    return res.status(429).json({ error: "RATE_LIMIT" });
  }

  return next();
}
