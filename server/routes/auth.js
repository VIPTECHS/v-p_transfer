import { Router } from "express";
import bcrypt from "bcryptjs";
import { verifyAdminPassword, signAgencyToken, signAdminToken } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/rateLimit.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/login", loginRateLimit, async (req, res) => {
  try {
    const { password } = req.body;
    const valid = await verifyAdminPassword(password);
    if (!valid) {
      return res.status(401).json({ error: "INVALID_PASSWORD" });
    }
    const token = signAdminToken();
    return res.json({ success: true, role: "admin", token });
  } catch (error) {
    console.error("POST /auth/login", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/agency-login", loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "VALIDATION" });
    }

    const agency = await prisma.agency.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!agency || !agency.isActive) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const valid = await bcrypt.compare(password, agency.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const token = signAgencyToken(agency);
    return res.json({
      success: true,
      role: "agency",
      token,
      agencyId: agency.id,
      agencyName: agency.name,
    });
  } catch (error) {
    console.error("POST /auth/agency-login", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
