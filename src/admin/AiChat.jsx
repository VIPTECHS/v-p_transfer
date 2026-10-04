import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Send, Trash2, Settings as SettingsIcon, Check, X, Loader2, MessageSquare } from "lucide-react";
import {
  aiCreateChat, aiDecideProposal, aiDeleteChat, aiFetchConfig, aiGetChat, aiListChats, aiSendMessage,
} from "../api/admin";
import AiSettings from "./AiSettings";
import "./ai.css";

const SUGGESTIONS = [
  "Bugünkü transferleri listele",
  "Atanmamış (sürücüsüz) yarınki transferler hangileri?",
  "Bu ayın ciro ve kâr özeti",
  "Süresi dolmak üzere olan belgeler",
];

const ERROR_TEXT = {
  AI_NOT_CONFIGURED: "Yapay zekâ henüz bağlanmamış. Sağ üstteki ayarlardan API bilgilerini girin.",
  BUSY: "Önceki mesaj hâlâ işleniyor, birkaç saniye bekleyin.",
  AI_ERROR: "Model yanıt vermedi.",
};

const RISK_LABEL = { high: "Silme", money: "Para / cari", normal: "Değişiklik" };
const METHOD_LABEL = { POST: "Ekle", PATCH: "Düzenle", PUT: "Düzenle", DELETE: "Sil" };

function ProposalCard({ message, onDecide, busy }) {
  const p = message.proposal;
  const [open, setOpen] = useState(false);
  const decided = p.status !== "pending";
  return (
    <div className={`ai-card ai-card--${p.risk} ai-card--${p.status}`}>
      <div className="ai-card__head">
        <span className="ai-card__badge">{RISK_LABEL[p.risk] || "Değişiklik"}</span>
        <span className="ai-card__method">{METHOD_LABEL[p.method] || p.method}</span>
      </div>
      <p className="ai-card__summary">{p.summary || "(özet yok)"}</p>
      <button type="button" className="ai-card__toggle" onClick={() => setOpen((v) => !v)}>
        {open ? "Ayrıntıyı gizle" : "Teknik ayrıntı"}
      </button>
      {open && (
        <pre className="ai-card__code">
          {p.method} {p.path}
          {p.body && Object.keys(p.body).length ? `\n${JSON.stringify(p.body, null, 2)}` : ""}
        </pre>
      )}
      {!decided && (
        <div className="ai-card__actions">
          <button type="button" className="admin-btn admin-btn--gold" disabled={busy} onClick={() => onDecide(message, true)}>
            <Check size={14} /> Onayla
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" disabled={busy} onClick={() => onDecide(message, false)}>
            <X size={14} /> Reddet
          </button>
        </div>
      )}
      {p.status === "running" && <div className="ai-card__state">Uygulanıyor…</div>}
      {p.status === "done" && <div className="ai-card__state ai-card__state--ok">✓ Uygulandı</div>}
      {p.status === "rejected" && <div className="ai-card__state">Reddedildi</div>}
      {p.status === "failed" && (
        <div className="ai-card__state ai-card__state--err">
          Uygulanamadı{p.result?.status ? ` (HTTP ${p.result.status})` : ""}
          {p.result?.data?.error ? `: ${p.result.data.error}` : p.result?.error ? `: ${p.result.error}` : ""}
        </div>
      )}
    </div>
  );
}

function Bubble({ message, onDecide, busy }) {
  if (message.role === "user") {
    return <div className="ai-msg ai-msg--user"><div className="ai-msg__body">{message.content}</div></div>;
  }
  if (message.role === "tool") {
    if (message.proposal) {
      return <div className="ai-msg ai-msg--assistant"><ProposalCard message={message} onDecide={onDecide} busy={busy} /></div>;
    }
    return <div className="ai-tool">🔎 {message.label || "Veri okundu"}</div>;
  }
  if (!message.content?.trim()) return null; // sadece araç çağıran ara adım
  return <div className="ai-msg ai-msg--assistant"><div className="ai-msg__body">{message.content}</div></div>;
}

export default function AiChat({ standalone = false, onLogout }) {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);
  const endRef = useRef(null);

  const refreshChats = useCallback(() => aiListChats().then(setChats).catch(() => {}), []);

  useEffect(() => {
    refreshChats();
    aiFetchConfig()
      .then((c) => {
        setConfigured(c.configured);
        if (!c.configured) setShowSettings(true);
      })
      .catch(() => {});
  }, [refreshChats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const openChat = async (id) => {
    setChatId(id);
    setShowSettings(false);
    setSideOpen(false);
    setError("");
    try {
      const c = await aiGetChat(id);
      setMessages(c.messages);
    } catch {
      setError("Sohbet yüklenemedi.");
    }
  };

  const newChat = () => {
    setChatId(null);
    setMessages([]);
    setError("");
    setShowSettings(false);
    setSideOpen(false);
  };

  const removeChat = async (id) => {
    if (!window.confirm("Bu sohbet silinsin mi? (Yapılan işlemler geri alınmaz.)")) return;
    await aiDeleteChat(id).catch(() => {});
    if (id === chatId) newChat();
    refreshChats();
  };

  const send = async (override) => {
    const content = (override ?? text).trim();
    if (!content || sending) return;
    setError("");
    setSending(true);
    setText("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content }]);
    try {
      let id = chatId;
      if (!id) {
        const chat = await aiCreateChat();
        id = chat.id;
        setChatId(id);
      }
      const r = await aiSendMessage(id, content);
      // Geçici kullanıcı mesajı yerine sunucudaki gerçek mesajları yükle.
      const full = await aiGetChat(id);
      setMessages(full.messages.length ? full.messages : r.messages);
      refreshChats();
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      const base = ERROR_TEXT[err.message] || "Bir hata oluştu.";
      setError(err.detail ? `${base} Ayrıntı: ${err.detail}` : base);
      if (err.message === "AI_NOT_CONFIGURED") {
        setConfigured(false);
        setShowSettings(true);
      }
      if (chatId) aiGetChat(chatId).then((c) => setMessages(c.messages)).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const decide = async (message, approve) => {
    setDeciding(true);
    setError("");
    try {
      const r = await aiDecideProposal(chatId, message.id, approve);
      setMessages((list) => list.map((m) => (m.id === message.id ? r.message : m)));
    } catch (err) {
      setError(err.message === "ALREADY_DECIDED" ? "Bu kart zaten işlendi." : "Onay işlenemedi.");
      aiGetChat(chatId).then((c) => setMessages(c.messages)).catch(() => {});
    } finally {
      setDeciding(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const pending = messages.filter((m) => m.proposal?.status === "pending").length;

  return (
    <div className={`ai-root${standalone ? " ai-root--standalone" : ""}`}>
      <aside className={`ai-side${sideOpen ? " ai-side--open" : ""}`}>
        <div className="ai-side__brand">
          <img src="/images/viptransfer-logo.png" alt="VIP Transfer" />
          <span>AI Asistan</span>
        </div>
        <button type="button" className="admin-btn admin-btn--gold ai-side__new" onClick={newChat}>
          <Plus size={16} /> Yeni sohbet
        </button>
        <div className="ai-side__list">
          {chats.map((c) => (
            <div key={c.id} className={`ai-side__item${c.id === chatId ? " active" : ""}`}>
              <button type="button" onClick={() => openChat(c.id)} title={c.title}>
                <MessageSquare size={14} /> <span>{c.title}</span>
              </button>
              <button type="button" className="ai-side__del" onClick={() => removeChat(c.id)} aria-label="Sohbeti sil">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {!chats.length && <p className="ai-side__empty">Henüz sohbet yok.</p>}
        </div>
        {standalone && onLogout && (
          <button type="button" className="admin-btn admin-btn--ghost ai-side__logout" onClick={onLogout}>
            Çıkış yap
          </button>
        )}
      </aside>

      <section className="ai-main">
        <header className="ai-top">
          <button type="button" className="ai-top__menu admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setSideOpen((v) => !v)}>
            Sohbetler
          </button>
          <div className="ai-top__title">
            {showSettings ? "Yapay zekâ ayarları" : "VIP Transfer Asistanı"}
            {pending > 0 && <span className="ai-top__pending">{pending} onay bekliyor</span>}
          </div>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setShowSettings((v) => !v)}>
            <SettingsIcon size={14} /> Ayarlar
          </button>
        </header>

        {showSettings ? (
          <div className="ai-pane">
            <AiSettings onSaved={(c) => { setConfigured(c.configured); if (c.configured) setShowSettings(false); }} />
          </div>
        ) : (
          <>
            <div className="ai-pane ai-scroll">
              {!messages.length && (
                <div className="ai-empty">
                  <h2>Ne yapmamı istersin?</h2>
                  <p>
                    Rezervasyon, müşteri, sürücü, araç, cari… Her şeyi yazarak yönetebilirsin. Ekleme, düzenleme ve silme
                    işlemlerinde önce <strong>onay kartı</strong> çıkar; sen onaylamadan hiçbir şey değişmez.
                  </p>
                  {!configured && <p className="ai-empty__warn">Önce Ayarlar’dan yapay zekâ bağlantısını girin.</p>}
                  <div className="ai-suggest">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} disabled={!configured}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => <Bubble key={m.id} message={m} onDecide={decide} busy={deciding} />)}
              {sending && (
                <div className="ai-msg ai-msg--assistant">
                  <div className="ai-msg__body ai-typing"><Loader2 size={14} className="ai-spin" /> Düşünüyor…</div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {error && <div className="admin-error ai-error">{error}</div>}
            <div className="ai-input">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder="Örn: Yarın 14:00 SAW → Taksim, 3 kişi, Mehmet Yılmaz için rezervasyon aç"
                rows={2}
                disabled={sending}
              />
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => send()} disabled={sending || !text.trim()} aria-label="Gönder">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
