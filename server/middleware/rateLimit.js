const windowMs = 60 * 1000;
const maxRequests = 120;
const hits = new Map();

function clientKey(req, prefix = "") {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return prefix ? `${prefix}:${ip}` : ip;
}

function createLimiter({ windowMs: ms, max, prefix = "" }) {
  const store = new Map();
  return (req, res, next) => {
    const key = clientKey(req, prefix);
    const now = Date.now();
    const entry = store.get(key) || { count: 0, reset: now + ms };

    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + ms;
    }

    entry.count += 1;
    store.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({ error: "RATE_LIMIT" });
    }
    return next();
  };
}

export const rateLimit = createLimiter({ windowMs, max: maxRequests });

/** Stricter limit for login endpoints (10 attempts / minute per IP) */
export const loginRateLimit = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  prefix: "login",
});
