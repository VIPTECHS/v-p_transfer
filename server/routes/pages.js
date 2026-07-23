import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { sanitizePageHtml } from "../lib/sanitizeHtml.js";

const router = Router();

const LANGS = ["tr", "en", "de"];
// Reserved slugs that must not be overridden by a custom page.
const RESERVED_SLUGS = new Set([
  "admin", "api", "blog", "de", "en", "tr", "deneyim", "medyada-biz",
  "yardim", "uploads", "assets", "images", "frames", "videos",
  "sitemap.xml", "robots.txt", "llms.txt", "istanbul-airport-transfer",
  "sabiha-gokcen-airport-transfer", "istanbul-vip-transfer",
  "istanbul-chauffeur-service", "istanbul-to-bursa-transfer",
  "istanbul-to-sapanca-transfer",
]);

function normalizeSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Build a clean translations object, sanitizing every language body.
function buildTranslations(input) {
  const out = {};
  for (const lang of LANGS) {
    const t = (input && input[lang]) || {};
    out[lang] = {
      title: String(t.title || "").trim(),
      metaDescription: String(t.metaDescription || "").trim().slice(0, 320),
      bodyHtml: sanitizePageHtml(t.bodyHtml || ""),
    };
  }
  return out;
}

function serialize(page) {
  let translations = {};
  try {
    translations = JSON.parse(page.translations || "{}");
  } catch {
    translations = {};
  }
  return {
    id: page.id,
    slug: page.slug,
    status: page.status,
    jsonLdType: page.jsonLdType || null,
    ogImage: page.ogImage || null,
    translations,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

// ---------- PUBLIC (no auth): fetch a published page by slug ----------
router.get("/public/:slug", async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    if (!slug) return res.status(404).json({ error: "NOT_FOUND" });
    const page = await prisma.customPage.findUnique({ where: { slug } });
    if (!page || page.status !== "published") {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    return res.json(serialize(page));
  } catch (error) {
    console.error("GET /pages/public/:slug", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ---------- ADMIN (protected) ----------
router.use(requireAdmin);

router.get("/", async (_req, res) => {
  try {
    const pages = await prisma.customPage.findMany({ orderBy: { updatedAt: "desc" } });
    return res.json(pages.map(serialize));
  } catch (error) {
    console.error("GET /pages", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const page = await prisma.customPage.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(serialize(page));
  } catch (error) {
    console.error("GET /pages/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  try {
    const slug = normalizeSlug(req.body.slug);
    if (!slug) return res.status(400).json({ error: "INVALID_SLUG" });
    if (RESERVED_SLUGS.has(slug)) return res.status(409).json({ error: "RESERVED_SLUG" });

    const existing = await prisma.customPage.findUnique({ where: { slug } });
    if (existing) return res.status(409).json({ error: "SLUG_TAKEN" });

    const translations = buildTranslations(req.body.translations);
    if (!translations.tr.title && !translations.en.title && !translations.de.title) {
      return res.status(400).json({ error: "TITLE_REQUIRED" });
    }

    const page = await prisma.customPage.create({
      data: {
        slug,
        status: req.body.status === "published" ? "published" : "draft",
        jsonLdType: req.body.jsonLdType?.trim() || null,
        ogImage: req.body.ogImage?.trim() || null,
        translations: JSON.stringify(translations),
      },
    });
    return res.status(201).json(serialize(page));
  } catch (error) {
    console.error("POST /pages", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const current = await prisma.customPage.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });

    const data = {};

    if (req.body.slug !== undefined) {
      const slug = normalizeSlug(req.body.slug);
      if (!slug) return res.status(400).json({ error: "INVALID_SLUG" });
      if (slug !== current.slug) {
        if (RESERVED_SLUGS.has(slug)) return res.status(409).json({ error: "RESERVED_SLUG" });
        const clash = await prisma.customPage.findUnique({ where: { slug } });
        if (clash) return res.status(409).json({ error: "SLUG_TAKEN" });
        data.slug = slug;
      }
    }

    if (req.body.translations !== undefined) {
      data.translations = JSON.stringify(buildTranslations(req.body.translations));
    }
    if (req.body.status !== undefined) {
      data.status = req.body.status === "published" ? "published" : "draft";
    }
    if (req.body.jsonLdType !== undefined) {
      data.jsonLdType = req.body.jsonLdType?.trim() || null;
    }
    if (req.body.ogImage !== undefined) {
      data.ogImage = req.body.ogImage?.trim() || null;
    }

    const page = await prisma.customPage.update({ where: { id: req.params.id }, data });
    return res.json(serialize(page));
  } catch (error) {
    console.error("PATCH /pages/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.customPage.delete({ where: { id: req.params.id } });
    return res.status(204).end();
  } catch (error) {
    console.error("DELETE /pages/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
