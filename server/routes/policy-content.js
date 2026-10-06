import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const LANGUAGES = ["tr", "en", "de"];
const POLICY_SLUGS = ["cancellation-policy", "terms-conditions", "privacy-policy", "cookie-policy"];

function validTarget(slug, language) {
  return POLICY_SLUGS.includes(slug) && LANGUAGES.includes(language);
}

router.get("/public/:slug/:language", async (req, res) => {
  const { slug, language } = req.params;
  if (!validTarget(slug, language)) return res.status(404).json({ error: "NOT_FOUND" });

  try {
    const content = await prisma.policyContent.findUnique({
      where: { slug_language: { slug, language } },
    });
    if (!content) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(content);
  } catch (error) {
    console.error("GET /policy-content/public/:slug/:language", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.policyContent.findMany({ orderBy: [{ slug: "asc" }, { language: "asc" }] });
    return res.json(items);
  } catch (error) {
    console.error("GET /policy-content", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.put("/:slug/:language", async (req, res) => {
  const { slug, language } = req.params;
  if (!validTarget(slug, language)) return res.status(404).json({ error: "NOT_FOUND" });

  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const intro = typeof req.body?.intro === "string" ? req.body.intro.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
  if (!title || title.length > 200 || !intro || intro.length > 1000 || !body || body.length > 30000) {
    return res.status(400).json({ error: "INVALID_CONTENT" });
  }

  try {
    const content = await prisma.policyContent.upsert({
      where: { slug_language: { slug, language } },
      create: { slug, language, title, intro, body },
      update: { title, intro, body },
    });
    return res.json(content);
  } catch (error) {
    console.error("PUT /policy-content/:slug/:language", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
