import { Router } from "express";
import { verifyAdminPassword } from "../middleware/auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (verifyAdminPassword(password)) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "INVALID_PASSWORD" });
});

export default router;
