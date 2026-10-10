import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { submitPartnerApplication } from "../api/partnerApplications";

export const PARTNER_APPLICATION_COPY = {
  tr: {
    title: "Acente Partner Başvurusu",
    lead: "İşletme bilgilerinizi paylaşın. Partnerlik ekibimiz başvurunuzu inceleyip sizinle iletişime geçsin.",
    back: "Seyahat Ortakları sayfasına dön",
    companyName: "Firma / Acente Adı",
    website: "Web Sitesi",
    websitePlaceholder: "www.firmaniz.com",
    countryCity: "Ülke / Şehir",
    countryCityPlaceholder: "Türkiye, İstanbul",
    contactName: "Yetkili Kişi Adı Soyadı",
    email: "E-posta Adresi",
    phone: "Telefon / WhatsApp",
    companyType: "Firma Türü",
    select: "Seçiniz",
    companyTypes: ["Seyahat Acentesi", "Tur Operatörü", "DMC", "OTA / Online Seyahat Sitesi", "Kurumsal Seyahat Firması", "Diğer"],
    monthlyVolume: "Aylık Tahmini Transfer Rezervasyon Adedi",
    volumes: ["1–10", "11–50", "51–100", "101–500", "500+"],
    destinations: "Hangi Ülke / Destinasyonlarda Transfer Hizmeti Almak İstiyorsunuz?",
    destinationsPlaceholder: "Ülke, şehir veya bölgeleri yazın",
    workPreference: "Çalışma Tercihiniz",
    preferences: ["B2B Partner Portalı", "API Entegrasyonu", "White Label", "Diğer"],
    otherPlaceholder: "Lütfen belirtin",
    notes: "Eklemek İstediğiniz Not / Talep",
    notesPlaceholder: "Başvurunuzla ilgili paylaşmak istedikleriniz",
    consentLead: "Gizlilik Politikası ve Partnerlik Koşulları’nı okudum ve kabul ediyorum.",
    privacy: "Gizlilik Politikası",
    terms: "Partnerlik Koşulları",
    submit: "Başvuruyu Gönder",
    sending: "Gönderiliyor…",
    successTitle: "Başvurunuz alındı",
    success: "Bilgileriniz partnerlik ekibimize iletildi. Ekibimiz sizinle iletişime geçecek.",
    error: "Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
    required: "Zorunlu alan",
  },
  en: {
    title: "Agency Partner Application",
    lead: "Tell us about your business. Our partnerships team will review your application and get in touch.",
    back: "Back to Travel Partners",
    companyName: "Company / Agency Name",
    website: "Website",
    websitePlaceholder: "www.yourcompany.com",
    countryCity: "Country / City",
    countryCityPlaceholder: "United Kingdom, London",
    contactName: "Authorised Contact Name",
    email: "Email Address",
    phone: "Phone / WhatsApp",
    companyType: "Company Type",
    select: "Select one",
    companyTypes: ["Travel Agency", "Tour Operator", "DMC", "OTA / Online Travel Site", "Corporate Travel Company", "Other"],
    monthlyVolume: "Estimated Monthly Transfer Bookings",
    volumes: ["1–10", "11–50", "51–100", "101–500", "500+"],
    destinations: "Which Countries / Destinations Do You Need Transfer Services In?",
    destinationsPlaceholder: "List countries, cities or regions",
    workPreference: "Preferred Partnership Model",
    preferences: ["B2B Partner Portal", "API Integration", "White Label", "Other"],
    otherPlaceholder: "Please specify",
    notes: "Additional Notes / Requests",
    notesPlaceholder: "Anything else you would like us to know",
    consentLead: "I have read and accept the Privacy Policy and Partner Terms.",
    privacy: "Privacy Policy",
    terms: "Partner Terms",
    submit: "Submit Application",
    sending: "Submitting…",
    successTitle: "Application received",
    success: "Your details have been sent to our partnerships team. We will be in touch.",
    error: "We could not submit your application. Check the details and try again.",
    required: "Required",
  },
  de: {
    title: "Bewerbung als Agenturpartner",
    lead: "Teilen Sie uns etwas über Ihr Unternehmen mit. Unser Partnerschaftsteam prüft Ihre Bewerbung und meldet sich bei Ihnen.",
    back: "Zurück zu Reisepartner",
    companyName: "Firmen- / Agenturname",
    website: "Website",
    websitePlaceholder: "www.ihrefirma.de",
    countryCity: "Land / Stadt",
    countryCityPlaceholder: "Deutschland, Berlin",
    contactName: "Name der Ansprechperson",
    email: "E-Mail-Adresse",
    phone: "Telefon / WhatsApp",
    companyType: "Unternehmenstyp",
    select: "Bitte auswählen",
    companyTypes: ["Reiseagentur", "Reiseveranstalter", "DMC", "OTA / Online-Reiseportal", "Geschäftsreiseunternehmen", "Sonstiges"],
    monthlyVolume: "Geschätzte Transferbuchungen pro Monat",
    volumes: ["1–10", "11–50", "51–100", "101–500", "500+"],
    destinations: "In welchen Ländern / Destinationen benötigen Sie Transfers?",
    destinationsPlaceholder: "Länder, Städte oder Regionen angeben",
    workPreference: "Bevorzugtes Kooperationsmodell",
    preferences: ["B2B-Partnerportal", "API-Integration", "White Label", "Sonstiges"],
    otherPlaceholder: "Bitte angeben",
    notes: "Weitere Hinweise / Wünsche",
    notesPlaceholder: "Was sollten wir noch wissen?",
    consentLead: "Ich habe die Datenschutzrichtlinie und die Partnerbedingungen gelesen und akzeptiere sie.",
    privacy: "Datenschutzrichtlinie",
    terms: "Partnerbedingungen",
    submit: "Bewerbung senden",
    sending: "Wird gesendet…",
    successTitle: "Bewerbung eingegangen",
    success: "Ihre Angaben wurden an unser Partnerschaftsteam gesendet. Wir melden uns bei Ihnen.",
    error: "Die Bewerbung konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben.",
    required: "Pflichtfeld",
  },
};

const initialValues = {
  companyName: "", website: "", countryCity: "", contactName: "", email: "", phone: "",
  companyType: "", companyTypeOther: "", monthlyVolume: "", destinations: "",
  workPreference: "", workPreferenceOther: "", notes: "", privacyAccepted: false, fax: "",
};

export default function PartnerApplicationForm() {
  const { lang } = useI18n();
  const copy = PARTNER_APPLICATION_COPY[lang] || PARTNER_APPLICATION_COPY.en;
  const [values, setValues] = useState(initialValues);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await submitPartnerApplication({
        ...values,
        companyName: values.companyName.trim(),
        countryCity: values.countryCity.trim(),
        contactName: values.contactName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        destinations: values.destinations.trim(),
        notes: values.notes.trim(),
      });
      setSubmitted(true);
    } catch {
      setError(copy.error);
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div className="partner-application-success" role="status" aria-live="polite">
        <span className="partner-application-success__mark" aria-hidden="true">✓</span>
        <h2>{copy.successTitle}</h2>
        <p>{copy.success}</p>
      </div>
    );
  }

  return (
    <form className="partner-application-form" onSubmit={submit}>
      <div className="partner-application-fields">
        <label>
          <span>{copy.companyName} *</span>
          <input name="companyName" value={values.companyName} onChange={update} maxLength={200} autoComplete="organization" required />
        </label>
        <label>
          <span>{copy.website}</span>
          <input name="website" value={values.website} onChange={update} maxLength={240} placeholder={copy.websitePlaceholder} autoComplete="url" />
        </label>
        <label>
          <span>{copy.countryCity} *</span>
          <input name="countryCity" value={values.countryCity} onChange={update} maxLength={200} placeholder={copy.countryCityPlaceholder} autoComplete="country-name" required />
        </label>
        <label>
          <span>{copy.contactName} *</span>
          <input name="contactName" value={values.contactName} onChange={update} maxLength={160} autoComplete="name" required />
        </label>
        <label>
          <span>{copy.email} *</span>
          <input name="email" type="email" value={values.email} onChange={update} maxLength={254} autoComplete="email" required />
        </label>
        <label>
          <span>{copy.phone} *</span>
          <input name="phone" type="tel" value={values.phone} onChange={update} maxLength={30} autoComplete="tel" required />
        </label>
        <label>
          <span>{copy.companyType} *</span>
          <select name="companyType" value={values.companyType} onChange={update} required>
            <option value="">{copy.select}</option>
            {["travel_agency", "tour_operator", "dmc", "ota", "corporate_travel", "other"].map((value, index) => (
              <option key={value} value={value}>{copy.companyTypes[index]}</option>
            ))}
          </select>
        </label>
        {values.companyType === "other" && (
          <label>
            <span>{copy.otherPlaceholder}</span>
            <input name="companyTypeOther" value={values.companyTypeOther} onChange={update} maxLength={160} />
          </label>
        )}
        <label>
          <span>{copy.monthlyVolume} *</span>
          <select name="monthlyVolume" value={values.monthlyVolume} onChange={update} required>
            <option value="">{copy.select}</option>
            {["1-10", "11-50", "51-100", "101-500", "500+"].map((value, index) => (
              <option key={value} value={value}>{copy.volumes[index]}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{copy.workPreference} *</span>
          <select name="workPreference" value={values.workPreference} onChange={update} required>
            <option value="">{copy.select}</option>
            {["b2b_portal", "api", "white_label", "other"].map((value, index) => (
              <option key={value} value={value}>{copy.preferences[index]}</option>
            ))}
          </select>
        </label>
        {values.workPreference === "other" && (
          <label>
            <span>{copy.otherPlaceholder}</span>
            <input name="workPreferenceOther" value={values.workPreferenceOther} onChange={update} maxLength={160} />
          </label>
        )}
        <label className="partner-application-field--wide">
          <span>{copy.destinations} *</span>
          <textarea name="destinations" value={values.destinations} onChange={update} maxLength={2000} rows={3} placeholder={copy.destinationsPlaceholder} required />
        </label>
        <label className="partner-application-field--wide">
          <span>{copy.notes}</span>
          <textarea name="notes" value={values.notes} onChange={update} maxLength={3000} rows={3} placeholder={copy.notesPlaceholder} />
        </label>
      </div>

      <div className="partner-application-honeypot" aria-hidden="true">
        <label>Fax<input name="fax" value={values.fax} onChange={update} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="partner-application-consent">
        <input name="privacyAccepted" type="checkbox" checked={values.privacyAccepted} onChange={update} required />
        <span>
          {copy.consentLead}{" "}
          <a href="/privacy-policy" target="_blank" rel="noreferrer">{copy.privacy}</a>{" · "}
          <a href="/terms-conditions" target="_blank" rel="noreferrer">{copy.terms}</a>
        </span>
      </label>

      {error && <p className="partner-application-error" role="alert">{error}</p>}
      <button className="btn btn-gold partner-application-submit" type="submit" disabled={pending}>
        {pending ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
