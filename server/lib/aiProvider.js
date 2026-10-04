import { getAiConfig } from "./aiConfig.js";

// OpenAI uyumlu /chat/completions istemcisi. NVIDIA NIM
// (https://integrate.api.nvidia.com/v1), OpenAI, OpenRouter, Gemini'nin OpenAI
// uyumlu ucu ve yerel sunucular aynı formatı konuşur.
export class AiNotConfiguredError extends Error {}

export async function chatCompletion({ messages, tools, signal }) {
  const cfg = await getAiConfig();
  if (!cfg.baseUrl || !cfg.model || !cfg.apiKey) throw new AiNotConfiguredError("AI_NOT_CONFIGURED");

  const body = { model: cfg.model, messages, temperature: 0.2 };
  if (tools?.length) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  signal?.addEventListener?.("abort", () => controller.abort());
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    if (!res.ok) {
      const detail = json?.error?.message || json?.detail || json?.message || text.slice(0, 300);
      const err = new Error(`PROVIDER_${res.status}: ${detail}`);
      err.status = res.status;
      throw err;
    }
    const msg = json?.choices?.[0]?.message;
    if (!msg) throw new Error("PROVIDER_EMPTY_RESPONSE");
    return msg;
  } finally {
    clearTimeout(timer);
  }
}
