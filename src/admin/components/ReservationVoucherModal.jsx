import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Mail, MessageCircle } from "lucide-react";

const GOLD = "#d4af37";
const CHARCOAL = "#171717";

const CONTACT_PHONE = "+90 850 255 48 47";
const CONTACT_EMAIL = "info@viptransfer.com";
const CONTACT_WEB = "viptransfer.com";

const TEXT = {
  tr: {
    pickTitle: "Belge Dili",
    pickSubtitle: "Rezervasyon belgesi hangi dilde oluşturulsun?",
    pickTr: "Türkçe",
    pickEn: "English",
    modalTitle: "Rezervasyon Belgesi Hazır",
    modalSubtitle: "Belgeyi indirin, ardından WhatsApp veya e-posta ile yolcuya iletin (belgeyi sohbete/eke elle ekleyin).",
    reference: "Referans",
    customer: "Müşteri",
    date: "Tarih & Saat",
    route: "Güzergah",
    vehicle: "Araç",
    passengers: "Yolcu",
    guest: "Misafir",
    close: "Kapat",
    download: "Belgeyi İndir",
    whatsapp: "WhatsApp ile Gönder",
    email: "E-posta ile Gönder",
    noPhone: "Müşteri telefon numarası kayıtlı değil. ",
    noEmail: "Müşteri e-posta adresi kayıtlı değil.",
    docTitle: "Rezervasyonunuz Onaylandı",
    docSubtitle: "Bu belgeyi saklayın, karşılamada şoförünüze gösterin.",
    docCustomer: "MÜŞTERİ",
    docDate: "TARİH & SAAT",
    docRoute: "GÜZERGAH",
    docVehicle: "ARAÇ",
    docPassengers: "YOLCU",
    docContact: "SORULARINIZ İÇİN BİZE ULAŞIN",
    dateLocale: "tr-TR",
    waMessage: (b) => `Merhaba ${b.customerName}, rezervasyonunuz #${b.reference} numarasıyla onaylanmıştır.\nTarih: ${b.dateText}\nGüzergah: ${b.route}\nAraç: ${b.vehicleName}\n\nRezervasyon belgenizi ektedir. İyi yolculuklar dileriz.`,
    emailSubject: (b) => `VIP Transfer Rezervasyon Belgeniz - #${b.reference}`,
    emailBody: (b) => `Merhaba ${b.customerName},\n\nRezervasyonunuz #${b.reference} numarasıyla onaylanmıştır.\nTarih: ${b.dateText}\nGüzergah: ${b.route}\nAraç: ${b.vehicleName}\n\nRezervasyon belgenizi bu e-postaya ekleyerek gönderiyoruz.\n\nİyi yolculuklar dileriz.\nVIP Transfer`,
  },
  en: {
    pickTitle: "Document Language",
    pickSubtitle: "Which language should the reservation document be created in?",
    pickTr: "Türkçe",
    pickEn: "English",
    modalTitle: "Reservation Document Ready",
    modalSubtitle: "Download the document, then send it to the passenger via WhatsApp or email (attach it manually).",
    reference: "Reference",
    customer: "Customer",
    date: "Date & Time",
    route: "Route",
    vehicle: "Vehicle",
    passengers: "Passengers",
    guest: "Guest",
    close: "Close",
    download: "Download Document",
    whatsapp: "Send via WhatsApp",
    email: "Send via Email",
    noPhone: "No phone number on file for this customer. ",
    noEmail: "No email address on file for this customer.",
    docTitle: "Your Reservation is Confirmed",
    docSubtitle: "Please keep this document and show it to your driver on arrival.",
    docCustomer: "CUSTOMER",
    docDate: "DATE & TIME",
    docRoute: "ROUTE",
    docVehicle: "VEHICLE",
    docPassengers: "PASSENGERS",
    docContact: "CONTACT US FOR ANY QUESTIONS",
    dateLocale: "en-GB",
    waMessage: (b) => `Hello ${b.customerName}, your reservation #${b.reference} is confirmed.\nDate: ${b.dateText}\nRoute: ${b.route}\nVehicle: ${b.vehicleName}\n\nYour reservation document is attached. Have a great trip!`,
    emailSubject: (b) => `Your VIP Transfer Reservation Document - #${b.reference}`,
    emailBody: (b) => `Hello ${b.customerName},\n\nYour reservation #${b.reference} is confirmed.\nDate: ${b.dateText}\nRoute: ${b.route}\nVehicle: ${b.vehicleName}\n\nPlease find your reservation document attached to this email.\n\nHave a great trip!\nVIP Transfer`,
  },
};

function formatDateTime(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(locale) + " " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function customerName(customer) {
  if (!customer) return "";
  return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
}

function buildVoucherData(reservation, t) {
  const firstTransfer = reservation.transfers?.[0];
  return {
    reference: reservation.reference,
    customerName: customerName(reservation.customer) || t.guest,
    phone: reservation.customer?.phone || "",
    email: reservation.customer?.email || "",
    dateText: firstTransfer ? formatDateTime(firstTransfer.transferDate, t.dateLocale) : "",
    route: firstTransfer ? `${firstTransfer.fromLabel || "—"} → ${firstTransfer.toLabel || "—"}` : "—",
    vehicleName: reservation.assignedVehicle?.name || "—",
    passengers: reservation.passengers?.length || 0,
  };
}

function buildQrText(b) {
  return [
    "VIP TRANSFER",
    `Reference: ${b.reference}`,
    `Customer: ${b.customerName}`,
    `Date: ${b.dateText}`,
    `Route: ${b.route}`,
    `Vehicle: ${b.vehicleName}`,
    `Passengers: ${b.passengers}`,
  ].join("\n");
}

function onlyDigits(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function renderCardCanvas(qrImg, b, t) {
  const W = 760;
  const H = 1000;
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = CHARCOAL;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 0, W, 10);

  ctx.fillStyle = GOLD;
  ctx.font = "700 34px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("VIP TRANSFER", W / 2, 66);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Arial, sans-serif";
  ctx.fillText(t.docTitle, W / 2, 102);
  ctx.fillStyle = "#9a9a9a";
  ctx.font = "400 14px Arial, sans-serif";
  ctx.fillText(t.docSubtitle, W / 2, 126);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px 'Courier New', monospace";
  ctx.fillText(b.reference, W / 2, 178);

  const qrSize = 240;
  const qrX = (W - qrSize) / 2;
  const qrY = 208;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  const rows = [
    [t.docCustomer, b.customerName],
    [t.docDate, b.dateText],
    [t.docRoute, b.route],
    [t.docVehicle, b.vehicleName],
    [t.docPassengers, String(b.passengers)],
  ];
  let y = qrY + qrSize + 68;
  const padX = 56;
  ctx.textAlign = "left";
  rows.forEach(([label, value]) => {
    ctx.fillStyle = "#7a7a7a";
    ctx.font = "600 13px Arial, sans-serif";
    ctx.fillText(label, padX, y);

    ctx.fillStyle = "#ffffff";
    ctx.font = "400 19px Arial, sans-serif";
    ctx.fillText(String(value), padX, y + 26);
    y += 64;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(padX, y - 18);
    ctx.lineTo(W - padX, y - 18);
    ctx.stroke();
  });

  // Contact footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#7a7a7a";
  ctx.font = "600 12px Arial, sans-serif";
  ctx.fillText(t.docContact, W / 2, y + 28);
  ctx.fillStyle = "#e5e5e5";
  ctx.font = "400 15px Arial, sans-serif";
  ctx.fillText(`${CONTACT_PHONE}  ·  ${CONTACT_EMAIL}  ·  ${CONTACT_WEB}`, W / 2, y + 54);

  ctx.fillStyle = GOLD;
  ctx.fillRect(0, H - 8, W, 8);

  return canvas;
}

export default function ReservationVoucherModal({ reservation, onClose }) {
  const [lang, setLang] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const qrImgRef = useRef(null);

  const t = lang ? TEXT[lang] : null;
  const b = t ? buildVoucherData(reservation, t) : null;

  useEffect(() => {
    if (!lang || !b) return undefined;
    let cancelled = false;
    QRCode.toDataURL(buildQrText(b), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 520,
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
  }, [lang, reservation.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDownload = () => {
    const img = qrImgRef.current;
    if (!img || !img.complete) return;
    const canvas = renderCardCanvas(img, b, t);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${b.reference}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  if (!lang) {
    const pt = TEXT.tr;
    return (
      <div className="rv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="rv-modal rv-modal--pick" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="rv-close" onClick={onClose} aria-label={pt.close}>
            <X size={18} />
          </button>
          <h2 className="rv-title">{pt.pickTitle}</h2>
          <p className="rv-subtitle">{pt.pickSubtitle}</p>
          <div className="rv-lang-actions">
            <button type="button" className="rv-action rv-action--download" onClick={() => setLang("tr")}>
              {pt.pickTr}
            </button>
            <button type="button" className="rv-action rv-action--email" onClick={() => setLang("en")}>
              {pt.pickEn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const whatsAppMessage = t.waMessage(b);
  const whatsAppHref = b.phone
    ? `https://wa.me/${onlyDigits(b.phone)}?text=${encodeURIComponent(whatsAppMessage)}`
    : null;

  const emailSubject = t.emailSubject(b);
  const emailBody = t.emailBody(b);
  const emailHref = b.email
    ? `mailto:${b.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : null;

  return (
    <div className="rv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rv-close" onClick={onClose} aria-label={t.close}>
          <X size={18} />
        </button>

        <h2 className="rv-title">{t.modalTitle}</h2>
        <p className="rv-subtitle">{t.modalSubtitle}</p>

        <div className="rv-ref">
          <span>{t.reference}</span>
          <strong>{b.reference}</strong>
        </div>

        <div className="rv-qr">
          {qrUrl ? (
            <img ref={qrImgRef} src={qrUrl} alt="QR" width={180} height={180} />
          ) : (
            <div className="rv-qr-loading" />
          )}
        </div>

        <div className="rv-rows">
          <div className="rv-row"><span>{t.customer}</span><strong>{b.customerName}</strong></div>
          <div className="rv-row"><span>{t.date}</span><strong>{b.dateText}</strong></div>
          <div className="rv-row"><span>{t.route}</span><strong>{b.route}</strong></div>
          <div className="rv-row"><span>{t.vehicle}</span><strong>{b.vehicleName}</strong></div>
          <div className="rv-row"><span>{t.passengers}</span><strong>{b.passengers}</strong></div>
        </div>

        <p className="rv-contact">{CONTACT_PHONE} · {CONTACT_EMAIL} · {CONTACT_WEB}</p>

        <div className="rv-actions">
          <button type="button" className="rv-action rv-action--download" onClick={handleDownload} disabled={!qrUrl}>
            <Download size={16} /> {t.download}
          </button>
          <a
            className={`rv-action rv-action--whatsapp${!whatsAppHref ? " rv-action--disabled" : ""}`}
            href={whatsAppHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (!whatsAppHref) e.preventDefault(); }}
          >
            <MessageCircle size={16} /> {t.whatsapp}
          </a>
          <a
            className={`rv-action rv-action--email${!emailHref ? " rv-action--disabled" : ""}`}
            href={emailHref || undefined}
            onClick={(e) => { if (!emailHref) e.preventDefault(); }}
          >
            <Mail size={16} /> {t.email}
          </a>
        </div>
        {(!b.phone || !b.email) && (
          <p className="rv-hint">
            {!b.phone && t.noPhone}
            {!b.email && t.noEmail}
          </p>
        )}
      </div>
    </div>
  );
}
