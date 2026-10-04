import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { clearAiKey, getPublicAiConfig, saveAiConfig } from "../lib/aiConfig.js";
import { AiNotConfiguredError, chatCompletion } from "../lib/aiProvider.js";
import { decideProposal, runTurn } from "../lib/aiAgent.js";

const router = Router();
router.use(requireAdmin);

// Aynı anda sohbet başına tek model çağrısı: çift gönderimi engeller.
const busy = new Set();

/** Depolanan mesajı istemciye uygun (ham OpenAI alanları olmadan) biçime çevirir. */
function present(id, stored, createdAt) {
  if (stored.meta?.hidden) return null;
  return {
    id,
    role: stored.role,
    content: stored.content,
    toolCalls: stored.tool_calls?.map((c) => ({ id: c.id, name: c.function?.name })),
    toolName: stored.name,
    label: stored.meta?.label,
    proposal: stored.proposal,
    createdAt,
  };
}

function presentRow(row) {
  let stored;
  try {
    stored = JSON.parse(row.content);
  } catch {
    stored = { role: row.role, content: row.content };
  }
  return present(row.id, stored, row.createdAt);
}

router.get("/config", async (_req, res) => {
  res.json(await getPublicAiConfig());
});

router.put("/config", async (req, res) => {
  try {
    const { baseUrl, model, apiKey, clearKey } = req.body || {};
    await saveAiConfig({ baseUrl, model, apiKey });
    if (clearKey) await clearAiKey();
    res.json(await getPublicAiConfig());
  } catch (error) {
    const code = error.message === "BASE_URL_HTTPS_REQUIRED" ? "BASE_URL_HTTPS_REQUIRED" : "VALIDATION";
    res.status(400).json({ error: code });
  }
});

router.post("/config/test", async (_req, res) => {
  try {
    const reply = await chatCompletion({ messages: [{ role: "user", content: "Sadece tamam yaz." }] });
    res.json({ ok: true, reply: String(reply.content || "").slice(0, 80) });
  } catch (error) {
    const notConfigured = error instanceof AiNotConfiguredError;
    res.status(notConfigured ? 400 : 502).json({
      ok: false,
      error: notConfigured ? "AI_NOT_CONFIGURED" : String(error.message || error).slice(0, 300),
    });
  }
});

router.get("/chats", async (_req, res) => {
  res.json(await prisma.aiChat.findMany({ orderBy: { updatedAt: "desc" }, take: 60 }));
});

router.post("/chats", async (_req, res) => {
  res.status(201).json(await prisma.aiChat.create({ data: {} }));
});

router.get("/chats/:id", async (req, res) => {
  const chat = await prisma.aiChat.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!chat) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ id: chat.id, title: chat.title, messages: chat.messages.map(presentRow).filter(Boolean) });
});

router.delete("/chats/:id", async (req, res) => {
  await prisma.aiChat.deleteMany({ where: { id: req.params.id } });
  res.status(204).end();
});

router.post("/chats/:id/messages", async (req, res) => {
  const text = String(req.body?.text || "").trim().slice(0, 4000);
  if (!text) return res.status(400).json({ error: "VALIDATION" });
  const chat = await prisma.aiChat.findUnique({ where: { id: req.params.id } });
  if (!chat) return res.status(404).json({ error: "NOT_FOUND" });
  if (busy.has(chat.id)) return res.status(409).json({ error: "BUSY" });

  busy.add(chat.id);
  try {
    if (chat.title === "Yeni sohbet") {
      await prisma.aiChat.update({ where: { id: chat.id }, data: { title: text.slice(0, 60) } });
    }
    const created = await runTurn(chat.id, text);
    const messages = created
      .map((m) => {
        const { _id, _createdAt, ...stored } = m;
        return present(_id, stored, _createdAt);
      })
      .filter(Boolean);
    res.json({ messages });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) return res.status(400).json({ error: "AI_NOT_CONFIGURED" });
    console.error("POST /ai/chats/:id/messages", error);
    res.status(502).json({ error: "AI_ERROR", detail: String(error.message || error).slice(0, 300) });
  } finally {
    busy.delete(chat.id);
  }
});

router.post("/chats/:id/proposals/:messageId", async (req, res) => {
  try {
    const approve = req.body?.approve === true;
    const msg = await decideProposal(req.params.id, req.params.messageId, approve);
    const { _id, _createdAt, ...stored } = msg;
    res.json({ message: present(_id, stored, _createdAt) });
  } catch (error) {
    const status = { NOT_FOUND: 404, NOT_A_PROPOSAL: 409, ALREADY_DECIDED: 409 }[error.message];
    if (status) return res.status(status).json({ error: error.message });
    console.error("POST /ai/proposals", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
