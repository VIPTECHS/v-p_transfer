import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus, ArrowUp, Trash2, Settings as SettingsIcon, Check, X, Loader2, MessageSquare,
  Paperclip, Mic, AudioLines, Square, Menu, FileText, Copy,
} from "lucide-react";
import {
  aiCreateChat, aiDecideProposal, aiDeleteChat, aiFetchConfig, aiGetChat, aiListChats, aiSendMessage,
} from "../api/admin";
import AiSettings from "./AiSettings";
import AiMarkdown, { plainForSpeech } from "./AiMarkdown";
import "./ai.css";

const USER_NAME = "Onursal";

const SUGGESTIONS = [
  "Bugünkü transferleri listele",
  "Yarın sürücüsü atanmamış transferler hangileri?",
  "Bu ayın ciro ve kâr özeti",
  "Süresi dolmak üzere olan belgeler",
];

const ERROR_TEXT = {
  AI_NOT_CONFIGURED: "Yapay zekâ henüz bağlanmamış. Sağ üstteki ayarlardan API bilgilerini girin.",
  BUSY: "Önceki mesaj hâlâ işleniyor, birkaç saniye bekleyin.",
  AI_ERROR: "Model yanıt vermedi.",
  ATTACHMENTS_INVALID: "Ek dosya geçersiz veya çok büyük.",
};

const RISK_LABEL = { high: "Silme", money: "Para / cari", normal: "Değişiklik" };
const METHOD_LABEL = { POST: "Ekle", PATCH: "Düzenle", PUT: "Düzenle", DELETE: "Sil" };

const MAX_ATTACHMENTS = 4;
const TEXT_EXT = /\.(txt|csv|json|md|log|tsv|xml|html?)$/i;
const SpeechRecognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

async function imageToDataUrl(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // şeffaf PNG'ler siyah kalmasın
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  let q = 0.82;
  let data = canvas.toDataURL("image/jpeg", q);
  while (data.length > 1_800_000 && q > 0.4) {
    q -= 0.1;
    data = canvas.toDataURL("image/jpeg", q);
  }
  return data;
}

async function fileToAttachment(file) {
  if (file.type.startsWith("image/")) {
    return { kind: "image", name: file.name, data: await imageToDataUrl(file) };
  }
  if (file.type.startsWith("text/") || file.type === "application/json" || TEXT_EXT.test(file.name)) {
    const text = await file.text();
    return { kind: "text", name: file.name, data: text.slice(0, 100_000) };
  }
  throw new Error("UNSUPPORTED");
}

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
          <button type="button" className="ai-btn ai-btn--primary" disabled={busy} onClick={() => onDecide(message, true)}>
            <Check size={14} /> Onayla
          </button>
          <button type="button" className="ai-btn" disabled={busy} onClick={() => onDecide(message, false)}>
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

function Attachments({ items }) {
  if (!items?.length) return null;
  return (
    <div className="ai-attach-row">
      {items.map((a, i) =>
        a.kind === "image" && a.data ? (
          <img key={i} src={a.data} alt={a.name} className="ai-attach-img" />
        ) : (
          <span key={i} className="ai-attach-file"><FileText size={14} /> {a.name}</span>
        ),
      )}
    </div>
  );
}

function Bubble({ message, onDecide, busy }) {
  const [copied, setCopied] = useState(false);
  if (message.role === "user") {
    return (
      <div className="ai-msg ai-msg--user">
        <div className="ai-msg__body">
          <Attachments items={message.attachments} />
          {message.content && <div className="ai-user-text">{message.content}</div>}
        </div>
      </div>
    );
  }
  if (message.role === "tool") {
    if (message.proposal) {
      return <div className="ai-msg ai-msg--assistant"><div className="ai-avatar">AI</div><ProposalCard message={message} onDecide={onDecide} busy={busy} /></div>;
    }
    return <div className="ai-tool">🔎 {message.label || "Veri okundu"}</div>;
  }
  if (!message.content?.trim()) return null; // sadece araç çağıran ara adım
  const copy = () => {
    navigator.clipboard?.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  return (
    <div className="ai-msg ai-msg--assistant">
      <div className="ai-avatar">AI</div>
      <div className="ai-msg__col">
        <div className="ai-msg__body"><AiMarkdown text={message.content} /></div>
        <button type="button" className="ai-copy" onClick={copy} aria-label="Kopyala">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function AiChat({ standalone = false, onLogout }) {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const endRef = useRef(null);
  const fileRef = useRef(null);
  const taRef = useRef(null);
  const recRef = useRef(null);
  const voiceRef = useRef(false);
  const sendRef = useRef(null);
  const textRef = useRef("");
  textRef.current = text;
  voiceRef.current = voiceMode;

  const refreshChats = useCallback(() => aiListChats().then(setChats).catch(() => {}), []);

  useEffect(() => {
    refreshChats();
    aiFetchConfig()
      .then((c) => {
        setConfigured(c.configured);
        if (!c.configured) setShowSettings(true);
      })
      .catch(() => {});
    return () => {
      recRef.current?.abort?.();
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, [refreshChats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [text]);

  // ---- Ses: konuşma tanıma + sesli okuma ----
  const stopListening = useCallback(() => {
    recRef.current?.abort?.();
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    recRef.current?.abort?.();
    const rec = new SpeechRecognition();
    rec.lang = "tr-TR";
    rec.interimResults = true;
    rec.continuous = false;
    const base = textRef.current ? `${textRef.current.trim()} ` : "";
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setText(base + finalText + interim);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Mikrofon izni verilmedi. Tarayıcı adres çubuğundan izin verin.");
        setVoiceMode(false);
      }
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      const spoken = (base + finalText).trim();
      if (voiceRef.current && finalText.trim()) sendRef.current?.(spoken);
      else if (voiceRef.current) setVoiceMode(false); // sessizlik: sesli sohbeti kapat
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const speak = useCallback((content) => {
    if (!canSpeak) return Promise.resolve();
    return new Promise((resolve) => {
      const clean = plainForSpeech(content).slice(0, 1500);
      if (!clean) return resolve();
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = "tr-TR";
      const tr = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("tr"));
      if (tr) u.voice = tr;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); resolve(); };
      u.onerror = () => { setSpeaking(false); resolve(); };
      window.speechSynthesis.speak(u);
    });
  }, []);

  const stopSpeaking = () => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const toggleVoiceMode = () => {
    if (voiceMode) {
      setVoiceMode(false);
      voiceRef.current = false;
      stopListening();
      stopSpeaking();
    } else {
      setVoiceMode(true);
      voiceRef.current = true;
      setText("");
      startListening();
    }
  };

  // ---- Sohbet ----
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
    setFiles([]);
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

  const addFiles = async (list) => {
    setError("");
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    if (files.length + incoming.length > MAX_ATTACHMENTS) {
      setError(`En fazla ${MAX_ATTACHMENTS} dosya eklenebilir.`);
      return;
    }
    const added = [];
    for (const f of incoming) {
      try {
        added.push(await fileToAttachment(f));
      } catch {
        setError(`"${f.name}" desteklenmiyor. Görsel (JPG/PNG/WebP) ve metin dosyaları (TXT, CSV, JSON, MD) eklenebilir.`);
      }
    }
    if (added.length) setFiles((prev) => [...prev, ...added]);
  };

  const send = async (override) => {
    const content = (typeof override === "string" ? override : text).trim();
    if ((!content && !files.length) || sending) return;
    const attachments = files;
    setError("");
    setSending(true);
    setText("");
    setFiles([]);
    stopSpeaking();
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content, attachments }]);
    let id = chatId;
    let reply = "";
    try {
      if (!id) {
        const chat = await aiCreateChat();
        id = chat.id;
        setChatId(id);
      }
      const r = await aiSendMessage(id, content, attachments);
      const full = await aiGetChat(id);
      setMessages(full.messages.length ? full.messages : r.messages);
      reply = [...r.messages].reverse().find((m) => m.role === "assistant" && m.content?.trim())?.content || "";
      refreshChats();
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      const base = ERROR_TEXT[err.message] || "Bir hata oluştu.";
      setError(err.detail ? `${base} Ayrıntı: ${err.detail}` : base);
      if (err.message === "AI_NOT_CONFIGURED") {
        setConfigured(false);
        setShowSettings(true);
      }
      if (id) aiGetChat(id).then((c) => setMessages(c.messages)).catch(() => {});
    } finally {
      setSending(false);
    }
    // Sesli sohbet: yanıtı oku, bitince tekrar dinle.
    if (voiceRef.current) {
      if (reply) await speak(reply);
      if (voiceRef.current) startListening();
    }
  };
  sendRef.current = send;

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
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const onPaste = (e) => {
    const imgs = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) {
      e.preventDefault();
      addFiles(imgs);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer?.files);
  };

  const pending = messages.filter((m) => m.proposal?.status === "pending").length;
  const empty = !messages.length;

  const composer = (
    <div className="ai-composer-wrap">
      {error && <div className="ai-error">{error}</div>}
      <div className={`ai-composer${listening ? " ai-composer--live" : ""}`}>
        {files.length > 0 && (
          <div className="ai-files">
            {files.map((f, i) => (
              <div key={i} className="ai-file">
                {f.kind === "image" ? <img src={f.data} alt={f.name} /> : <FileText size={16} />}
                <span>{f.name}</span>
                <button type="button" onClick={() => setFiles((p) => p.filter((_, n) => n !== i))} aria-label="Eki kaldır"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onPaste={onPaste}
          placeholder={listening ? "Dinliyorum…" : "Bir şey sor veya işlem yaptır…"}
          rows={1}
          disabled={sending}
        />
        <div className="ai-composer__bar">
          <input ref={fileRef} type="file" multiple hidden accept="image/*,.txt,.csv,.json,.md,.log,.tsv,.xml,.html" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <button type="button" className="ai-icon" onClick={() => fileRef.current?.click()} title="Dosya veya görsel ekle" disabled={sending}>
            <Paperclip size={18} />
          </button>
          <div className="ai-composer__spacer" />
          {SpeechRecognition && (
            <button type="button" className={`ai-icon${listening && !voiceMode ? " ai-icon--live" : ""}`} onClick={toggleMic} title="Sesle yaz" disabled={sending || voiceMode}>
              <Mic size={18} />
            </button>
          )}
          {speaking ? (
            <button type="button" className="ai-send" onClick={stopSpeaking} title="Okumayı durdur"><Square size={14} /></button>
          ) : text.trim() || files.length ? (
            <button type="button" className="ai-send" onClick={() => send()} disabled={sending} aria-label="Gönder"><ArrowUp size={18} /></button>
          ) : SpeechRecognition ? (
            <button type="button" className={`ai-send ai-send--voice${voiceMode ? " ai-send--on" : ""}`} onClick={toggleVoiceMode} title={voiceMode ? "Sesli sohbeti bitir" : "Sesli sohbet"}>
              <AudioLines size={18} />
            </button>
          ) : (
            <button type="button" className="ai-send" disabled aria-label="Gönder"><ArrowUp size={18} /></button>
          )}
        </div>
      </div>
      <p className="ai-disclaimer">
        {voiceMode ? "Sesli sohbet açık: konuş, yanıt sesli okunur. Bitirmek için tekrar simgeye bas." : "AI hata yapabilir. Değişiklikler sen onaylamadan uygulanmaz."}
      </p>
    </div>
  );

  return (
    <div
      className={`ai-root${standalone ? " ai-root--standalone" : ""}${dragOver ? " ai-root--drag" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
      onDrop={onDrop}
    >
      <aside className={`ai-side${sideOpen ? " ai-side--open" : ""}`}>
        <div className="ai-side__brand">
          <img src="/images/viptransfer-logo.png" alt="VIP Transfer" />
        </div>
        <button type="button" className="ai-side__new" onClick={newChat}>
          <Plus size={16} /> Yeni sohbet
        </button>
        <div className="ai-side__label">Sohbetler</div>
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
        <div className="ai-side__foot">
          <button type="button" className="ai-side__link" onClick={() => { setShowSettings(true); setSideOpen(false); }}>
            <SettingsIcon size={14} /> Ayarlar
          </button>
          {standalone && onLogout && (
            <button type="button" className="ai-side__link" onClick={onLogout}>Çıkış yap</button>
          )}
        </div>
      </aside>
      {sideOpen && <button type="button" className="ai-scrim" aria-label="Menüyü kapat" onClick={() => setSideOpen(false)} />}

      <section className="ai-main">
        <header className="ai-top">
          <button type="button" className="ai-top__menu ai-icon" onClick={() => setSideOpen(true)} aria-label="Menü"><Menu size={20} /></button>
          <div className="ai-top__title">
            VIP Transfer Asistanı
            {pending > 0 && <span className="ai-top__pending">{pending} onay bekliyor</span>}
          </div>
          <button type="button" className="ai-icon" onClick={() => setShowSettings((v) => !v)} title="Ayarlar" aria-label="Ayarlar">
            <SettingsIcon size={18} />
          </button>
        </header>

        {showSettings ? (
          <div className="ai-pane">
            <AiSettings onSaved={(c) => { setConfigured(c.configured); if (c.configured) setShowSettings(false); }} />
          </div>
        ) : empty ? (
          <div className="ai-pane ai-hero">
            <h1>Hoş geldin, <span>{USER_NAME}</span></h1>
            <p className="ai-hero__sub">{greeting()}! Bugün ne yapmamı istersin?</p>
            {!configured && <p className="ai-hero__warn">Önce sağ üstteki Ayarlar’dan yapay zekâ bağlantısını girin.</p>}
            {composer}
            <div className="ai-suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} disabled={!configured}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="ai-pane ai-scroll">
              <div className="ai-thread">
                {messages.map((m) => <Bubble key={m.id} message={m} onDecide={decide} busy={deciding} />)}
                {sending && (
                  <div className="ai-msg ai-msg--assistant">
                    <div className="ai-avatar">AI</div>
                    <div className="ai-typing"><Loader2 size={14} className="ai-spin" /> Düşünüyor…</div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>
            {composer}
          </>
        )}
      </section>
    </div>
  );
}
