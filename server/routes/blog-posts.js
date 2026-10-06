import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { blogArticleCreateSchema, blogArticleUpdateSchema, parseBody } from "../lib/validation.js";

const router = Router();

function parseTranslations(raw) {
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

function serialize(article, summaryOnly = false) {
  const translations = parseTranslations(article.translations);
  if (summaryOnly) {
    for (const language of Object.keys(translations)) {
      const { title, excerpt } = translations[language];
      translations[language] = { title, excerpt };
    }
  }
  return { ...article, translations };
}

function validCoverImage(value) {
  if (value == null || value === "") return true;
  return (/^https?:\/\//i.test(value) || (value.startsWith("/") && !value.startsWith("//")))
    && !value.includes("..") && !/[\r\n]/.test(value);
}

router.get("/public/:slug", async (req, res) => {
  try {
    const article = await prisma.blogArticle.findFirst({
      where: { slug: req.params.slug, status: "published" },
    });
    if (!article) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(serialize(article));
  } catch (error) {
    console.error("GET /blog-posts/public/:slug", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/public", async (_req, res) => {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 30,
    });
    return res.json(articles.map((article) => serialize(article, true)));
  } catch (error) {
    console.error("GET /blog-posts/public", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  try {
    const articles = await prisma.blogArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
    return res.json(articles.map((article) => serialize(article)));
  } catch (error) {
    console.error("GET /blog-posts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/", async (req, res) => {
  const parsed = parseBody(blogArticleCreateSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const data = parsed.data;
  if (!validCoverImage(data.coverImage)) return res.status(400).json({ error: "INVALID_COVER_IMAGE" });

  try {
    const status = data.status || "draft";
    const article = await prisma.blogArticle.create({
      data: {
        slug: data.slug,
        status,
        coverImage: data.coverImage || null,
        translations: JSON.stringify(data.translations),
        publishedAt: status === "published" ? new Date() : null,
      },
    });
    return res.status(201).json(serialize(article));
  } catch (error) {
    if (error?.code === "P2002") return res.status(409).json({ error: "SLUG_TAKEN" });
    console.error("POST /blog-posts", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  const parsed = parseBody(blogArticleUpdateSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const data = parsed.data;
  if (data.coverImage !== undefined && !validCoverImage(data.coverImage)) {
    return res.status(400).json({ error: "INVALID_COVER_IMAGE" });
  }

  try {
    const existing = await prisma.blogArticle.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
    const update = {};
    if (data.slug !== undefined) update.slug = data.slug;
    if (data.coverImage !== undefined) update.coverImage = data.coverImage || null;
    if (data.translations !== undefined) update.translations = JSON.stringify(data.translations);
    if (data.status !== undefined && data.status !== existing.status) {
      update.status = data.status;
      update.publishedAt = data.status === "published" ? new Date() : null;
    }
    const article = await prisma.blogArticle.update({ where: { id: existing.id }, data: update });
    return res.json(serialize(article));
  } catch (error) {
    if (error?.code === "P2002") return res.status(409).json({ error: "SLUG_TAKEN" });
    console.error("PATCH /blog-posts/:id", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
