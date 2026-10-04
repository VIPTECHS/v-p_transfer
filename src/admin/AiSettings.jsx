import { useEffect, useState } from "react";
import { aiFetchConfig, aiSaveConfig, aiTestConfig } from "../api/admin";

// Hepsi OpenAI uyumlu /chat/completions konuşur. Model adı sağlayıcının
// kataloğundan alınır; araç (function calling) destekleyen bir model seçin.
const PRESETS = [
  { id: "nvidia", label: "NVIDIA NIM", baseUrl: "https://integrate.api.nvidia.com/v1", model: "meta/llama-3.3-70b-instruct" },
  { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o" },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "anthropic/claude-sonnet-4.5" },
  { id: "gemini", label: "Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.5-flash" },
];

const ERRORS = {
  BASE_URL_HTTPS_REQUIRED: "Adres https:// ile başlamalı.",
  VALIDATION: "Adres geçersiz.",
  AI_NOT_CONFIGURED: "Önce adres, model ve API anahtarını kaydedin.",
};

export default function AiSettings({ onSaved }) {
  const [cfg, setCfg] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    aiFetchConfig()
      .then((c) => {
        setCfg(c);
        setBaseUrl(c.baseUrl);
        setModel(c.model);
      })
      .catch(() => setNotice({ type: "error", text: "Ayarlar yüklenemedi." }));
  }, []);

  const applyPreset = (p) => {
    setBaseUrl(p.baseUrl);
    setModel(p.model);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const next = await aiSaveConfig({ baseUrl, model, apiKey });
      setCfg(next);
      setApiKey("");
      setNotice({ type: "ok", text: "Kaydedildi." });
      onSaved?.(next);
    } catch (err) {
      setNotice({ type: "error", text: ERRORS[err.message] || "Kaydedilemedi." });
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const r = await aiTestConfig();
      setNotice({ type: "ok", text: `Bağlantı başarılı. Model cevabı: "${r.reply}"` });
    } catch (err) {
      setNotice({ type: "error", text: ERRORS[err.message] || err.detail || err.message || "Bağlantı başarısız." });
    } finally {
      setBusy(false);
    }
  };

  if (!cfg) return <div className="ai-settings">Yükleniyor…</div>;

  return (
    <form className="ai-settings admin-card" onSubmit={save}>
      <h2>Yapay zekâ bağlantısı</h2>
      <p className="ai-settings__hint">
        OpenAI uyumlu herhangi bir sağlayıcı çalışır. API anahtarı sunucuda şifreli saklanır, tekrar gösterilmez.
      </p>

      <div className="ai-presets">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <label>
        API adresi (base URL)
        <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://integrate.api.nvidia.com/v1" />
      </label>
      <label>
        Model
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="meta/llama-3.3-70b-instruct" />
      </label>
      <label>
        API anahtarı {cfg.hasKey && <span className="ai-settings__key">kayıtlı: {cfg.keyPreview}</span>}
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={cfg.hasKey ? "Değiştirmek için yeni anahtar girin" : "nvapi-..."}
          autoComplete="off"
        />
      </label>

      {notice && <div className={notice.type === "ok" ? "ai-notice ai-notice--ok" : "admin-error"}>{notice.text}</div>}

      <div className="ai-settings__actions">
        <button type="submit" className="admin-btn admin-btn--gold" disabled={busy}>
          Kaydet
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={test} disabled={busy || !cfg.configured}>
          Bağlantıyı test et
        </button>
      </div>
    </form>
  );
}
