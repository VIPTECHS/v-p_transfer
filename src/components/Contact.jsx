import { useState } from "react";
import { submitEnquiry } from "../api/enquiry";
import { EMAIL, PHONE, PHONE_DISPLAY, WHATSAPP_URL } from "../data/content";
import { useI18n } from "../i18n/I18nContext";

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  );
}

export default function Contact() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      await submitEnquiry({ name, email, message });
      setStatus("success");
      setFeedback(t("contact.success"));
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setFeedback(error.message === "VALIDATION" ? t("contact.validation") : t("contact.error"));
    }
  };

  const offices = [
    { key: "istanbul", hasCompany: true },
    { key: "cyprus", hasCompany: false },
    { key: "england", hasCompany: false },
  ];

  return (
    <section className="contact" id="contact">
      <div className="contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.text")}</p>

          <div className="contact-channels">
            <span className="contact-channels-label">{t("contact.channelsTitle")}</span>
            <a className="channel channel--wa" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <span className="channel-icon"><WhatsAppIcon /></span>
              <span className="channel-body">
                <strong>{t("contact.whatsappChannel")}</strong>
                <span>{t("contact.whatsappValue")}</span>
              </span>
            </a>
            <a className="channel" href={`tel:${PHONE}`}>
              <span className="channel-icon"><PhoneIcon /></span>
              <span className="channel-body">
                <strong>{t("contact.callChannel")}</strong>
                <span>{PHONE_DISPLAY}</span>
              </span>
            </a>
            <a className="channel" href={`mailto:${EMAIL}`}>
              <span className="channel-icon"><MailIcon /></span>
              <span className="channel-body">
                <strong>{t("contact.emailChannel")}</strong>
                <span>{EMAIL}</span>
              </span>
            </a>
          </div>

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <h3>{t("contact.enquiryTitle")}</h3>
            <label>
              <span>{t("contact.nameLabel")}</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>{t("contact.emailLabel")}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              <span>{t("contact.messageLabel")}</span>
              <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </label>
            <button className="btn btn-gold" type="submit" disabled={status === "loading"}>
              {status === "loading" ? t("contact.submitting") : t("contact.submit")}
            </button>
            {feedback && (
              <p className={`enquiry-feedback enquiry-feedback--${status}`} role="status">{feedback}</p>
            )}
          </form>
        </div>

        <div className="office-grid">
          {offices.map(({ key, hasCompany }, index) => (
            <article className="office-card" key={key}>
              <div className="office-card-head">
                <span className="office-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="office-badge">{t("contact.availability")}</span>
              </div>
              <h3>{t(`contact.offices.${key}.name`)}</h3>
              {hasCompany && (
                <p className="office-company">{t(`contact.offices.${key}.company`)}</p>
              )}
              <div className="office-row">
                <span className="office-row-icon"><PinIcon /></span>
                <address>{t(`contact.offices.${key}.address`)}</address>
              </div>
              <a className="office-row office-link" href={`mailto:${EMAIL}`}>
                <span className="office-row-icon"><MailIcon /></span>
                <span>{EMAIL}</span>
              </a>
              <a className="office-row office-link" href={`tel:${PHONE}`}>
                <span className="office-row-icon"><PhoneIcon /></span>
                <span>{PHONE_DISPLAY}</span>
              </a>
            </article>
          ))}
        </div>
      </div>

      <p className="operations-note">
        {t("contact.operationsNote")} <strong>{t("about.tursab")}</strong>
      </p>
    </section>
  );
}
