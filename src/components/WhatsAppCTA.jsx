import { useEffect, useState } from "react";
import { WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";

function WhatsAppGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const SEEN_KEY = "wa-chat-seen";

export default function WhatsAppCTA() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Open the chat on its own shortly after load, once per session,
  // so it feels like a conversation is already waiting for the visitor.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      setDismissed(true);
      return;
    }
    // On phones the auto-opening chat covers the booking form, so only
    // auto-open on wider screens; the FAB stays tappable everywhere.
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return undefined;
    const timer = setTimeout(() => setOpen(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  const markSeen = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const closeChat = () => {
    setOpen(false);
    setDismissed(true);
    markSeen();
  };

  const toggleChat = () => {
    if (open) {
      closeChat();
    } else {
      setOpen(true);
      setDismissed(true);
      markSeen();
    }
  };

  return (
    <div className={`wa-widget${open ? " is-open" : ""}`}>
      {open && (
        <div className="wa-chat" role="dialog" aria-label={t("whatsapp.aria")}>
          <div className="wa-chat-head">
            <span className="wa-avatar">
              <WhatsAppGlyph width="22" height="22" />
            </span>
            <div className="wa-chat-id">
              <strong>{t("whatsapp.name")}</strong>
              <span className="wa-status">
                <i />
                {t("whatsapp.status")}
              </span>
            </div>
            <button
              type="button"
              className="wa-close"
              onClick={closeChat}
              aria-label={t("whatsapp.close")}
            >
              ×
            </button>
          </div>

          <div className="wa-chat-body">
            <div className="wa-msg">
              <p>{t("whatsapp.greeting")}</p>
              <span className="wa-time">{t("whatsapp.time")}</span>
            </div>
            <div className="wa-msg">
              <p>{t("whatsapp.prompt")}</p>
              <span className="wa-time">{t("whatsapp.time")}</span>
            </div>
          </div>

          <a
            className="wa-chat-cta"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={markSeen}
          >
            <WhatsAppGlyph width="18" height="18" />
            {t("whatsapp.start")}
          </a>
        </div>
      )}

      <button
        type="button"
        className="wa-fab"
        onClick={toggleChat}
        aria-label={t("whatsapp.aria")}
        aria-expanded={open}
      >
        {open ? (
          <span className="wa-fab-close">×</span>
        ) : (
          <>
            <WhatsAppGlyph width="28" height="28" />
            {!dismissed && <span className="wa-badge">1</span>}
          </>
        )}
      </button>
    </div>
  );
}
