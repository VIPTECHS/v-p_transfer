import prisma from "./prisma.js";
import { decryptSecret, encryptSecret } from "./secretBox.js";

const KEYS = ["ai.baseUrl", "ai.model", "ai.apiKey"];

async function readAll() {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: KEYS } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Sunucu içi kullanım: çözülmüş API anahtarıyla. İstemciye ASLA dönmez. */
export async function getAiConfig() {
  const s = await readAll();
  return {
    baseUrl: s["ai.baseUrl"] || "",
    model: s["ai.model"] || "",
    apiKey: s["ai.apiKey"] ? decryptSecret(s["ai.apiKey"]) : "",
  };
}

/** İstemciye dönen güvenli görünüm: anahtarın sadece son 4 hanesi. */
export async function getPublicAiConfig() {
  const c = await getAiConfig();
  return {
    baseUrl: c.baseUrl,
    model: c.model,
    hasKey: Boolean(c.apiKey),
    keyPreview: c.apiKey ? `••••${c.apiKey.slice(-4)}` : "",
    configured: Boolean(c.baseUrl && c.model && c.apiKey),
  };
}

function normalizeBaseUrl(raw) {
  const url = new URL(String(raw).trim());
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error("BASE_URL_HTTPS_REQUIRED");
  }
  return url.toString().replace(/\/+$/, "");
}

export async function saveAiConfig({ baseUrl, model, apiKey }) {
  const ops = [];
  const put = (key, value) =>
    ops.push(
      prisma.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } }),
    );
  if (typeof baseUrl === "string" && baseUrl.trim()) put("ai.baseUrl", normalizeBaseUrl(baseUrl));
  if (typeof model === "string" && model.trim()) put("ai.model", model.trim());
  // Boş gelen anahtar "değiştirme" demektir; silmek için ayrı clearKey.
  if (typeof apiKey === "string" && apiKey.trim()) put("ai.apiKey", encryptSecret(apiKey.trim()));
  await prisma.$transaction(ops);
}

export async function clearAiKey() {
  await prisma.appSetting.deleteMany({ where: { key: "ai.apiKey" } });
}
