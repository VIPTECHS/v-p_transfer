import { signAdminToken } from "../middleware/auth.js";

// Modelin kullanabildiği API alanları. /auth, /ai, /uploads ve acente şifre
// sıfırlama gibi hassas uçlar bilerek dışarıda.
const ALLOWED_PREFIXES = [
  "reservations", "customers", "suppliers", "agencies", "drivers", "vehicles",
  "operations", "payments", "ledger", "documents", "reports", "stats", "flights",
  "bookings", "enquiries", "countries", "cities", "districts", "locations", "pages",
];
const BLOCKED_PATTERNS = [/reset-password/i];
const MAX_RESULT_CHARS = 14_000;

export function normalizeApiPath(raw) {
  if (typeof raw !== "string") throw new Error("path gerekli");
  let p = raw.trim();
  if (/^[a-z]+:\/\//i.test(p) || p.startsWith("//")) throw new Error("Sadece göreli yol verilebilir");
  p = p.replace(/^\/?api\//, "/");
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.includes("..") || p.includes("\\")) throw new Error("Geçersiz yol");
  const first = p.split("?")[0].split("/")[1];
  if (!ALLOWED_PREFIXES.includes(first)) throw new Error(`İzin verilmeyen alan: /${first}`);
  if (BLOCKED_PATTERNS.some((re) => re.test(p))) throw new Error("Bu uç AI için kapalı");
  return p;
}

/**
 * Yerel döngü: panelin kendi API'sine admin yetkisiyle gider; böylece tüm
 * doğrulama ve yan etkiler (cari senkronu, bildirimler vb.) aynen çalışır.
 */
export async function callInternalApi(method, apiPath, body) {
  const port = process.env.PORT || 3001;
  const res = await fetch(`http://127.0.0.1:${port}/api${apiPath}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${signAdminToken()}`,
    },
    body: body !== undefined && method !== "GET" ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text.slice(0, 500);
  }
  return { ok: res.ok, status: res.status, data };
}

export function truncate(value) {
  let s = typeof value === "string" ? value : JSON.stringify(value);
  if (s === undefined) s = "null";
  if (s.length > MAX_RESULT_CHARS) {
    s = `${s.slice(0, MAX_RESULT_CHARS)}…[KESİLDİ: ${s.length} karakter. Daha dar bir sorgu/filtre kullan]`;
  }
  return s;
}

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "api_get",
      description:
        "Panel verisini OKUR (rezervasyon, müşteri, tedarikçi, acente, sürücü, araç, operasyon, ödeme, cari, rapor...). Sadece GET. Onay gerektirmez. Liste uçlarında arama/filtre query parametrelerini kullan.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Örn: /reservations?search=VIP-1024 veya /operations?date=2026-10-05" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_change",
      description:
        "Veriyi DEĞİŞTİRECEK bir işlem için onay kartı hazırlar (ekleme POST, düzenleme PATCH, silme DELETE). İşlem KENDİLİĞİNDEN ÇALIŞMAZ; kullanıcı kartı onaylayınca çalışır. Her değişiklik için ayrı çağır.",
      parameters: {
        type: "object",
        properties: {
          method: { type: "string", enum: ["POST", "PATCH", "PUT", "DELETE"] },
          path: { type: "string", description: "Örn: /reservations/ckx123/transfers" },
          body: { type: "object", description: "İstek gövdesi (DELETE için boş bırak)" },
          summary: {
            type: "string",
            description:
              "Kullanıcıya gösterilecek 1-2 cümlelik Türkçe özet: ne yapılacak, hangi kayıt, hangi değerler (eski → yeni).",
          },
        },
        required: ["method", "path", "summary"],
      },
    },
  },
];

export function proposalRisk(method, apiPath) {
  if (method === "DELETE") return "high";
  if (/^\/(ledger|payments)/.test(apiPath)) return "money";
  return "normal";
}

/** Okuma aracı: doğrudan çalışır. */
export async function runReadTool(args) {
  const p = normalizeApiPath(args?.path);
  const r = await callInternalApi("GET", p);
  return truncate({ status: r.status, data: r.data });
}

/** Değişiklik aracı: ÇALIŞTIRMAZ, sadece doğrulayıp onay kartı verisi üretir. */
export function buildProposal(args) {
  const method = String(args?.method || "").toUpperCase();
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) throw new Error("Geçersiz method");
  const p = normalizeApiPath(args?.path);
  return {
    method,
    path: p,
    body: method === "DELETE" ? undefined : args?.body ?? {},
    summary: String(args?.summary || "").slice(0, 600),
    risk: proposalRisk(method, p),
    status: "pending",
  };
}

export async function executeProposal(proposal) {
  const r = await callInternalApi(proposal.method, proposal.path, proposal.body);
  return { ok: r.ok, status: r.status, data: r.data === null ? undefined : r.data };
}
