import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  EMAIL, PHONE, PHONE_DISPLAY, FACEBOOK_URL, INSTAGRAM_URL, TURSAB_DDS_URL,
  APP_STORE_URL, GOOGLE_PLAY_URL, PATENT_VIP_URL,
} from "../data/content";
import { useI18n } from "../i18n/I18nContext";

const COLUMN_LINKS = {
  services: [
    { key: "airport", href: "/airport-transfer", type: "page" },
    { key: "chauffeur", href: "/chauffeur-service", type: "page" },
    { key: "hourly", href: "/hourly-hire", type: "page" },
    { key: "group", href: "/group-transfer", type: "page" },
    { key: "events", href: "/event-transfer", type: "page" },
  ],
  corporate: [
    { key: "about", href: "/about-us", type: "page" },
    { key: "accounts", href: "/corporate-accounts", type: "page" },
    { key: "blog", href: "#blog", type: "hash" },
    { key: "partners", href: "/travel-partners", type: "page" },
    { key: "contact", href: "#contact", type: "hash" },
  ],
  support: [
    { key: "faq", href: "/yardim", type: "page" },
    { key: "cancel", href: "/cancellation-policy", type: "page" },
    { key: "privacy", href: "/privacy-policy", type: "page" },
    { key: "terms", href: "/terms-conditions", type: "page" },
  ],
};

function PartnerNetworkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8.5" cy="7" r="3" />
      <circle cx="16.5" cy="8" r="2.4" />
      <path d="M2.2 19.2c.7-3.1 3.1-4.8 6.3-4.8s5.6 1.7 6.3 4.8" />
      <path d="M13.5 14.6c1.6-.6 3.4-.5 5 .5 1.4.9 2.2 2.3 2.6 4.1" />
    </svg>
  );
}

const PAYMENT_LOGOS = [
  { src: "/images/payments/visa.svg", label: "Visa" },
  { src: "/images/payments/mastercard.svg", label: "Mastercard" },
  { src: "/images/payments/amex.svg", label: "American Express" },
  { src: "/images/payments/wechat-pay.svg", label: "WeChat Pay" },
  { src: "/images/payments/unionpay.svg", label: "UnionPay" },
];

function PayLogo({ src, label }) {
  return (
    <span className="footer-pay" title={label} aria-label={label}>
      <img src={src} alt={label} loading="lazy" />
    </span>
  );
}

function AppStoreBadge() {
  return (
    <svg viewBox="0 0 135 40" aria-hidden="true">
      <rect width="135" height="40" rx="6" fill="#000" />
      <path fill="#fff" d="M24.8 20.3c-.04-4.3 3.5-6.4 3.66-6.5-2-2.9-5.1-3.3-6.2-3.4-2.64-.27-5.16 1.56-6.5 1.56-1.36 0-3.44-1.52-5.66-1.48-2.91.04-5.6 1.7-7.1 4.3-3.03 5.26-.77 13.04 2.17 17.32 1.44 2.08 3.15 4.42 5.4 4.34 2.17-.09 2.99-1.4 5.62-1.4 2.62 0 3.37 1.4 5.67 1.35 2.34-.04 3.82-2.12 5.24-4.21 1.65-2.4 2.33-4.74 2.36-4.86-.05-.02-4.53-1.74-4.57-6.91zM20.3 6.8c1.2-1.45 2.01-3.47 1.79-5.48-1.73.07-3.82 1.15-5.06 2.6-1.11 1.29-2.08 3.35-1.82 5.32 1.92.15 3.88-.98 5.09-2.44z" />
      <text x="44" y="14" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="8">Download on the</text>
      <text x="44" y="28" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="14">App Store</text>
    </svg>
  );
}

function GooglePlayBadge() {
  return (
    <svg viewBox="0 0 135 40" aria-hidden="true">
      <rect width="135" height="40" rx="6" fill="#000" />
      <path fill="#EA4335" d="M10 8.5 24.5 20 10 31.5V8.5z" />
      <path fill="#FBBC04" d="M10 8.5 24.5 20 32 14.5 10 8.5z" />
      <path fill="#34A853" d="M10 31.5 24.5 20 32 25.5 10 31.5z" />
      <path fill="#4285F4" d="M32 14.5 24.5 20 32 25.5 38 22.5 38 17.5 32 14.5z" />
      <text x="44" y="14" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="8">GET IT ON</text>
      <text x="44" y="28" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="14">Google Play</text>
    </svg>
  );
}

function FooterPatent({ t }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="footer-patent"
        onClick={() => setOpen(true)}
        aria-label={t("footer.patentAria")}
      >
        <img src={PATENT_VIP_URL} alt="Marka tescil belgesi" />
        <span className="footer-patent-label">{t("footer.patentLabel")}</span>
      </button>

      {open && createPortal(
        <div className="footer-patent-overlay" onClick={() => setOpen(false)} role="presentation">
          <div
            className="footer-patent-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t("footer.patentAria")}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="footer-patent-close"
              onClick={() => setOpen(false)}
              aria-label={t("footer.patentClose")}
            >
              ×
            </button>
            <img src={PATENT_VIP_URL} alt="Marka tescil belgesi" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function BadgeTursab() {
  return (
    <a
      className="footer-badge footer-badge--logo"
      href={TURSAB_DDS_URL}
      target="_blank"
      title="TÜRSAB Dijital Doğrulama"
      aria-label="TÜRSAB Dijital Doğrulama"
    >
      <img src="/images/tursab_logo.png" alt="TÜRSAB" />
    </a>
  );
}

function BadgeKitsab() {
  return (
    <span className="footer-badge footer-badge--logo" title="KITSAB" aria-label="KITSAB">
      <img src="/images/kitsab_logo.png" alt="KITSAB" />
    </span>
  );
}

function BadgeSsl() {
  return (
    <span className="footer-badge footer-badge--ssl" title="SSL Secure" aria-label="SSL Secure">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.2 5 6.2v4.8c0 4.4 3 7.6 7 8.6 4-1 7-4.2 7-8.6V6.2L12 3.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m9.3 12 1.9 1.9 3.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>SSL Secure</span>
    </span>
  );
}

export default function Footer({ navigate }) {
  const { t, lang } = useI18n();

  const goTo = (href, type) => (event) => {
    if (type === "hash") {
      if (!navigate) return;
      event.preventDefault();
      navigate(`/${lang}/`);
      requestAnimationFrame(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (!navigate) return;
    event.preventDefault();
    navigate(href);
  };

  const goHome = (event) => {
    if (!navigate) return;
    event.preventDefault();
    navigate(`/${lang}/`);
  };

  const goPartners = (event) => {
    event.preventDefault();
    if (navigate) navigate("/travel-partners");
  };

  return (
    <footer className="site-footer">
      <div className="footer-partner">
        <div className="footer-partner-inner">
          <div className="footer-partner-copy">
            <span className="footer-partner-icon" aria-hidden="true">
              <PartnerNetworkIcon />
            </span>
            <h2>{t("footer.partner.title")}</h2>
            <p>{t("footer.partner.text")}</p>
            <a className="footer-partner-cta" href="/travel-partners" onClick={goPartners}>
              {t("footer.partner.cta")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="footer-partner-stats" aria-label={t("footer.partner.statsAria")}>
            <div className="footer-partner-stat">
              <strong>{t("footer.partner.stats.partners.value")}</strong>
              <span>{t("footer.partner.stats.partners.label")}</span>
            </div>
            <div className="footer-partner-stat">
              <strong>{t("footer.partner.stats.countries.value")}</strong>
              <span>{t("footer.partner.stats.countries.label")}</span>
            </div>
            <div className="footer-partner-stat">
              <strong>{t("footer.partner.stats.support.value")}</strong>
              <span>{t("footer.partner.stats.support.label")}</span>
            </div>
          </div>

          <div className="footer-partner-visual" aria-hidden="true">
            <img className="footer-partner-globe" src="/images/vip_earth.png" alt="" />
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-brand-link" href={`/${lang}/`} onClick={goHome}>
            <img src="/images/viptransfer-logo.png" alt={t("brand.alt")} />
          </a>
          <p>{t("footer.tagline")}</p>
          <div className="socials">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z" /></svg>
            </a>
          </div>

          <div className="footer-apps">
            <p className="footer-apps-label">{t("footer.appsLabel")}</p>
            <div className="footer-apps-badges">
              <a className="footer-app-badge" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="App Store">
                <AppStoreBadge />
              </a>
              <a className="footer-app-badge" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" aria-label="Google Play">
                <GooglePlayBadge />
              </a>
            </div>
          </div>
        </div>

        {(["services", "corporate", "support"]).map((column) => (
          <div className="footer-column" key={column}>
            <h3>{t(`footer.columns.${column}.title`)}</h3>
            {COLUMN_LINKS[column].map((link) => (
              <a
                key={link.key}
                href={link.type === "hash" ? `/${lang}/${link.href}` : link.href}
                onClick={goTo(link.href, link.type)}
              >
                {t(`footer.columns.${column}.links.${link.key}`)}
              </a>
            ))}
            {column === "support" && <FooterPatent t={t} />}
          </div>
        ))}

        <div className="footer-column footer-column--contact">
          <h3>{t("footer.columns.contact.title")}</h3>
          <a className="footer-contact-row" href={`tel:${PHONE}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a className="footer-contact-row" href={`mailto:${EMAIL}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 7L2 7" />
            </svg>
            <span>{EMAIL}</span>
          </a>
          <div className="footer-contact-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>{t("footer.columns.contact.support")}</span>
          </div>
        </div>
      </div>

      <div className="footer-trust">
        <div className="footer-trust-badges">
          <BadgeTursab />
          <BadgeKitsab />
          <BadgeSsl />
        </div>
        <div className="footer-payments" aria-label={t("footer.paymentsAria")}>
          {PAYMENT_LOGOS.map((logo) => (
            <PayLogo key={logo.label} src={logo.src} label={logo.label} />
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.rights")}</span>
        <p className="footer-operations-note">
          {t("contact.operationsNote")} <strong>{t("about.tursab")}</strong>
        </p>
      </div>
    </footer>
  );
}
