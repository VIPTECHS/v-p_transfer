import { useState } from "react";

export default function AgencyAcceptPanel({
  accepting,
  declining,
  onAccept,
  onDecline,
  takenByOther,
  takenByName,
  declinedByMe,
  routedToMe,
}) {
  const [showDecline, setShowDecline] = useState(false);
  const [declineNote, setDeclineNote] = useState("");

  if (takenByOther) {
    return (
      <div className="accept-panel accept-panel--taken">
        <div className="accept-panel-icon accept-panel-icon--taken">✕</div>
        <div className="accept-panel-body">
          <h3>İlan Alındı</h3>
          <p>
            Bu ilan <strong>{takenByName || "başka bir acenta"}</strong> tarafından kabul edildi.
            Artık bu ilanı üstlenemezsiniz.
          </p>
        </div>
      </div>
    );
  }

  if (declinedByMe) {
    return (
      <div className="accept-panel accept-panel--taken">
        <div className="accept-panel-icon accept-panel-icon--taken">✕</div>
        <div className="accept-panel-body">
          <h3>İlanı Reddettiniz</h3>
          <p>Bu ilanı reddettiğiniz için artık listede görünmez. Admin farklı bir acentaya yönlendirebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`accept-panel accept-panel--pending ${routedToMe ? "accept-panel--routed" : ""}`}>
      <div className="accept-panel-glow" aria-hidden />
      <div className="accept-panel-content">
        <div className="accept-panel-icon">✓</div>
        <div className="accept-panel-body">
          <h3>{routedToMe ? "Size Yönlendirildi" : "Bu İlanı Kabul Et"}</h3>
          <p>
            {routedToMe
              ? "Admin bu ilanı doğrudan size yönlendirdi. Kabul veya red cevabınız kaydedilir."
              : "Kabul ettiğinizde ilan size atanır ve durum Onaylı olur."}
          </p>
          <ul className="accept-panel-steps">
            <li><span>1</span> İlanı inceleyin</li>
            <li><span>2</span> Kapasiteyi kontrol edin</li>
            <li><span>3</span> Kabul veya red verin</li>
          </ul>
        </div>
        <div className="accept-panel-buttons">
          <button
            type="button"
            className="accept-panel-btn"
            disabled={accepting || declining}
            onClick={onAccept}
          >
            {accepting ? "Kabul ediliyor..." : "İlanı Kabul Et"}
          </button>
          {routedToMe && !showDecline && (
            <button
              type="button"
              className="accept-panel-btn accept-panel-btn--decline"
              disabled={accepting || declining}
              onClick={() => setShowDecline(true)}
            >
              Reddet
            </button>
          )}
        </div>
      </div>
      {showDecline && (
        <div className="accept-panel-decline-form">
          <textarea
            placeholder="Red nedeni (isteğe bağlı)"
            value={declineNote}
            onChange={(e) => setDeclineNote(e.target.value)}
            rows={2}
          />
          <div className="accept-panel-decline-actions">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => { setShowDecline(false); setDeclineNote(""); }}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              disabled={declining}
              onClick={() => onDecline(declineNote)}
            >
              {declining ? "Gönderiliyor..." : "Reddi Onayla"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AgencyAcceptButton({ accepting, onAccept, compact }) {
  return (
    <button
      type="button"
      className={`accept-btn-inline ${compact ? "accept-btn-inline--compact" : ""}`}
      disabled={accepting}
      onClick={(e) => { e.stopPropagation(); onAccept(e); }}
    >
      <span className="accept-btn-inline-icon">✓</span>
      {accepting ? "..." : "Kabul Et"}
    </button>
  );
}
