import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "../i18n/I18nContext";

const GOLD = "#d4af37";
const CHARCOAL = "#171717";

// Builds the plain-text payload embedded in the QR code (vCard-like, offline).
function buildQrText(b, c) {
  return [
    "VIP TRANSFER",
    `${c.reference}: ${b.reference}`,
    `${c.customer}: ${b.customerName}`,
    `${c.date}: ${b.dateText}`,
    `${c.route}: ${b.route}`,
    `${c.vehicle}: ${b.vehicleName}`,
    `${c.passengers}: ${b.passengers}`,
    b.phone ? `Tel: ${b.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeCalendarText(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildCalendarFile(booking, labels) {
  const start = new Date(booking.pickupAt);
  if (Number.isNaN(start.getTime())) return null;

  const durationHours = Number(booking.durationHours) > 0 ? Number(booking.durationHours) : 2;
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const description = [
    `${labels.reference}: ${booking.reference}`,
    `${labels.customer}: ${booking.customerName}`,
    `${labels.vehicle}: ${booking.vehicleName}`,
    `${labels.passengers}: ${booking.passengers}`,
    booking.phone ? `Tel: ${booking.phone}` : null,
  ].filter(Boolean).join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VIPTransfer.com//Booking//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(booking.reference)}@viptransfer.com`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(start)}`,
    `DTEND:${formatCalendarDate(end)}`,
    `SUMMARY:${escapeCalendarText(`VIP Transfer - ${booking.vehicleName}`)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(booking.route)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// Draws the downloadable PNG confirmation card onto a canvas.
function renderCardCanvas(qrImg, b, c) {
  const W = 760;
  const H = 1040;
  const canvas = document.createElement("canvas");
  const scale = 2; // retina-quality export
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = CHARCOAL;
  ctx.fillRect(0, 0, W, H);

  // Gold top bar
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 0, W, 10);

  // Brand
  ctx.fillStyle = GOLD;
  ctx.font = "700 38px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("VIP TRANSFER", W / 2, 78);
  ctx.fillStyle = "#9a9a9a";
  ctx.font = "400 16px Arial, sans-serif";
  ctx.fillText(c.title, W / 2, 108);

  // Reference badge
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px 'Courier New', monospace";
  ctx.fillText(b.reference, W / 2, 168);

  // QR code (centered)
  const qrSize = 280;
  const qrX = (W - qrSize) / 2;
  const qrY = 200;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#9a9a9a";
  ctx.font = "400 14px Arial, sans-serif";
  ctx.fillText(c.qrHint, W / 2, qrY + qrSize + 44);

  // Detail rows
  const rows = [
    [c.customer, b.customerName],
    [c.date, b.dateText],
    [c.route, b.route],
    [c.vehicle, b.vehicleName],
    [c.passengers, String(b.passengers)],
  ];
  let y = qrY + qrSize + 92;
  const padX = 56;
  ctx.textAlign = "left";
  rows.forEach(([label, value]) => {
    ctx.fillStyle = "#7a7a7a";
    ctx.font = "600 13px Arial, sans-serif";
    ctx.fillText(String(label).toUpperCase(), padX, y);

    ctx.fillStyle = "#ffffff";
    ctx.font = "400 19px Arial, sans-serif";
    // wrap long values
    const maxWidth = W - padX * 2;
    const text = String(value);
    if (ctx.measureText(text).width > maxWidth) {
      const words = text.split(" ");
      let line = "";
      let ly = y + 26;
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, padX, ly);
          line = word;
          ly += 24;
        } else {
          line = test;
        }
      });
      ctx.fillText(line, padX, ly);
      y = ly + 44;
    } else {
      ctx.fillText(text, padX, y + 26);
      y += 64;
    }

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(padX, y - 18);
    ctx.lineTo(W - padX, y - 18);
    ctx.stroke();
  });

  // Footer
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, H - 8, W, 8);

  return canvas;
}

export default function BookingConfirmModal({ booking, onClose }) {
  const { t } = useI18n();
  const [qrUrl, setQrUrl] = useState("");
  const qrImgRef = useRef(null);

  const c = {
    title: t("booking.details.confirmation.title"),
    subtitle: t("booking.details.confirmation.subtitle"),
    reference: t("booking.details.confirmation.reference"),
    qrHint: t("booking.details.confirmation.qrHint"),
    customer: t("booking.details.confirmation.customer"),
    date: t("booking.details.confirmation.date"),
    route: t("booking.details.confirmation.route"),
    vehicle: t("booking.details.confirmation.vehicle"),
    passengers: t("booking.details.confirmation.passengers"),
    price: t("booking.details.confirmation.price"),
    download: t("booking.details.confirmation.download"),
    addToCalendar: t("booking.details.confirmation.addToCalendar"),
    close: t("booking.details.confirmation.close"),
  };

  // Generate QR on mount / when booking changes.
  useEffect(() => {
    if (!booking) return;
    let cancelled = false;
    QRCode.toDataURL(buildQrText(booking, c), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 560,
      color: { dark: CHARCOAL, light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  // Lock body scroll + Escape to close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!booking) return null;

  const handleDownload = () => {
    const img = qrImgRef.current;
    if (!img || !img.complete) return;
    const canvas = renderCardCanvas(img, booking, c);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${booking.reference}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  const handleAddToCalendar = () => {
    const calendar = buildCalendarFile(booking, c);
    if (!calendar) return;

    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${booking.reference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const rows = [
    [c.customer, booking.customerName],
    [c.date, booking.dateText],
    [c.route, booking.route],
    [c.vehicle, booking.vehicleName],
    [c.passengers, String(booking.passengers)],
  ];
  return (
    <div className="bc-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bc-close" onClick={onClose} aria-label={c.close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="bc-check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
        </div>

        <h2 className="bc-title">{c.title}</h2>
        <p className="bc-subtitle">{c.subtitle}</p>

        <div className="bc-ref">
          <span>{c.reference}</span>
          <strong>{booking.reference}</strong>
        </div>

        <div className="bc-qr">
          {qrUrl ? (
            <img ref={qrImgRef} src={qrUrl} alt="QR" width={200} height={200} />
          ) : (
            <div className="bc-qr-loading" />
          )}
        </div>
        <p className="bc-qr-hint">{c.qrHint}</p>

        <div className="bc-rows">
          {rows.map(([label, value]) => (
            <div className="bc-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="bc-actions">
          <button type="button" className="bc-action bc-action--download" onClick={handleDownload} disabled={!qrUrl}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {c.download}
          </button>
          <button type="button" className="bc-action bc-action--calendar" onClick={handleAddToCalendar} disabled={!booking.pickupAt}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4M10 16h4"/></svg>
            {c.addToCalendar}
          </button>
        </div>
      </div>
    </div>
  );
}
