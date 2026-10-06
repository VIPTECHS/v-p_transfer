import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { submitTransporterApplication } from "../api/transporterApplications";

const VEHICLE_KEYS = ["sedan", "business_sedan", "suv", "minivan_mpv", "vip_van", "minibus", "coach"];
const VEHICLE_LABELS = {
  tr: ["Sedan", "Business Sedan", "SUV", "Minivan / MPV", "VIP Van", "Minibüs", "Otobüs / Coach"],
  en: ["Sedan", "Business Sedan", "SUV", "Minivan / MPV", "VIP Van", "Minibus", "Bus / Coach"],
  de: ["Limousine", "Business-Limousine", "SUV", "Minivan / MPV", "VIP-Van", "Minibus", "Bus / Reisebus"],
};

const COPY = {
  tr: {
    title: "Taşımacı Partner Başvurusu",
    lead: "Firmanızın ve filonuzun bilgilerini paylaşın. Taşımacı partnerlik ekibimiz başvurunuzu inceleyip sizinle iletişime geçsin.",
    back: "Ana sayfaya dön",
    companyName: "Firma / Taşımacı Adı",
    onlinePresence: "Web Sitesi / Sosyal Medya Hesabı",
    location: "Ülke / Şehir",
    contact: "Yetkili Kişi Adı Soyadı",
    email: "E-posta Adresi",
    phone: "Telefon / WhatsApp",
    regions: "Hizmet Verdiğiniz / Verebileceğiniz Bölgeler, Şehirler ve Havalimanları",
    regionsHint: "Şehirleri, bölgeleri ve havalimanlarını listeleyin",
    vehicles: "Filonuzdaki Araç Tipleri",
    vehicleCount: "Yaklaşık Araç Sayısı",
    vehicleCounts: ["1–5", "6–10", "11–25", "26–50", "50+"],
    allDay: "7/24 Transfer Hizmeti Verebiliyor musunuz?",
    fixedPrice: "Havalimanı Transferleri İçin Sabit / Net B2B Fiyat Sunabiliyor musunuz?",
    yes: "Evet",
    no: "Hayır",
    notes: "Eklemek İstediğiniz Not / İş Birliği Talebi",
    notesHint: "İş birliğiyle ilgili eklemek istedikleriniz",
    consent: "Gizlilik Politikası ve Taşımacı Partner Koşulları’nı okudum ve kabul ediyorum.",
    privacy: "Gizlilik Politikası",
    terms: "Taşımacı Partner Koşulları",
    submit: "Başvuruyu Gönder",
    sending: "Gönderiliyor…",
    successTitle: "Başvurunuz alındı",
    success: "Taşımacı partner başvurunuz ekibimize iletildi. En kısa sürede sizinle iletişime geçeceğiz.",
    error: "Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
    choose: "En az bir araç tipi seçin",
  },
  en: {
    title: "Transport Provider Partner Application",
    lead: "Share your company and fleet details. Our transport partnerships team will review your application and get in touch.",
    back: "Back to home",
    companyName: "Company / Transport Provider Name",
    onlinePresence: "Website / Social Media Account",
    location: "Country / City",
    contact: "Authorised Contact Name",
    email: "Email Address",
    phone: "Phone / WhatsApp",
    regions: "Regions, Cities and Airports You Serve or Can Cover",
    regionsHint: "List the cities, regions and airports you cover",
    vehicles: "Vehicle Types in Your Fleet",
    vehicleCount: "Approximate Fleet Size",
    vehicleCounts: ["1–5", "6–10", "11–25", "26–50", "50+"],
    allDay: "Can you provide transfer service 24/7?",
    fixedPrice: "Can you offer fixed / net B2B rates for airport transfers?",
    yes: "Yes",
    no: "No",
    notes: "Additional Notes / Partnership Request",
    notesHint: "Anything else you would like us to know",
    consent: "I have read and accept the Privacy Policy and Transport Provider Partner Terms.",
    privacy: "Privacy Policy",
    terms: "Transport Provider Partner Terms",
    submit: "Submit Application",
    sending: "Submitting…",
    successTitle: "Application received",
    success: "Your transport partner application has been sent to our team. We will be in touch soon.",
    error: "We could not submit your application. Check the details and try again.",
    choose: "Select at least one vehicle type",
  },
  de: {
    title: "Bewerbung als Transportpartner",
    lead: "Teilen Sie uns Informationen zu Ihrem Unternehmen und Ihrer Flotte mit. Unser Team prüft Ihre Bewerbung und meldet sich bei Ihnen.",
    back: "Zur Startseite",
    companyName: "Firmen- / Transportdienstleistername",
    onlinePresence: "Website / Social-Media-Konto",
    location: "Land / Stadt",
    contact: "Name der Ansprechperson",
    email: "E-Mail-Adresse",
    phone: "Telefon / WhatsApp",
    regions: "Regionen, Städte und Flughäfen, die Sie bedienen können",
    regionsHint: "Städte, Regionen und Flughäfen auflisten",
    vehicles: "Fahrzeugtypen Ihrer Flotte",
    vehicleCount: "Ungefähre Flottengröße",
    vehicleCounts: ["1–5", "6–10", "11–25", "26–50", "50+"],
    allDay: "Können Sie Transfers rund um die Uhr anbieten?",
    fixedPrice: "Können Sie feste / Netto-B2B-Preise für Flughafentransfers anbieten?",
    yes: "Ja",
    no: "Nein",
    notes: "Weitere Hinweise / Kooperationsanfrage",
    notesHint: "Was sollten wir noch wissen?",
    consent: "Ich habe die Datenschutzrichtlinie und die Bedingungen für Transportpartner gelesen und akzeptiere sie.",
    privacy: "Datenschutzrichtlinie",
    terms: "Bedingungen für Transportpartner",
    submit: "Bewerbung senden",
    sending: "Wird gesendet…",
    successTitle: "Bewerbung eingegangen",
    success: "Ihre Bewerbung als Transportpartner wurde gesendet. Wir melden uns bald bei Ihnen.",
    error: "Die Bewerbung konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben.",
    choose: "Wählen Sie mindestens einen Fahrzeugtyp",
  },
};

const EMPTY_VALUES = {
  companyName: "", onlinePresence: "", countryCity: "", contactName: "", email: "", phone: "",
  serviceRegions: "", vehicleTypes: [], vehicleCount: "", offers24h: "", offersFixedB2bPrice: "",
  notes: "", privacyAccepted: false, fax: "",
};

export default function TransporterApplicationForm() {
  const { lang } = useI18n();
  const copy = COPY[lang] || COPY.en;
  const vehicles = VEHICLE_LABELS[lang] || VEHICLE_LABELS.en;
  const [values, setValues] = useState(EMPTY_VALUES);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleVehicle = (vehicle) => {
    setValues((current) => ({
      ...current,
      vehicleTypes: current.vehicleTypes.includes(vehicle)
        ? current.vehicleTypes.filter((item) => item !== vehicle)
        : [...current.vehicleTypes, vehicle],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!values.vehicleTypes.length) { setError(copy.choose); return; }
    setPending(true);
    try {
      await submitTransporterApplication({
        ...values,
        companyName: values.companyName.trim(),
        onlinePresence: values.onlinePresence.trim(),
        countryCity: values.countryCity.trim(),
        contactName: values.contactName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        serviceRegions: values.serviceRegions.trim(),
        notes: values.notes.trim(),
        offers24h: values.offers24h === "yes",
        offersFixedB2bPrice: values.offersFixedB2bPrice === "yes",
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

  const yesNoField = (name, label) => (
    <fieldset className="partner-application-choice-field">
      <legend>{label} *</legend>
      <div className="partner-application-radio-row">
        {[["yes", copy.yes], ["no", copy.no]].map(([value, text]) => (
          <label key={value} className="partner-application-radio-option">
            <input type="radio" name={name} value={value} checked={values[name] === value} onChange={update} required />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <form className="partner-application-form" onSubmit={submit}>
      <div className="partner-application-fields">
        <label><span>{copy.companyName} *</span><input name="companyName" value={values.companyName} onChange={update} maxLength={200} autoComplete="organization" required /></label>
        <label><span>{copy.onlinePresence}</span><input name="onlinePresence" value={values.onlinePresence} onChange={update} maxLength={500} autoComplete="url" /></label>
        <label><span>{copy.location} *</span><input name="countryCity" value={values.countryCity} onChange={update} maxLength={200} autoComplete="country-name" required /></label>
        <label><span>{copy.contact} *</span><input name="contactName" value={values.contactName} onChange={update} maxLength={160} autoComplete="name" required /></label>
        <label><span>{copy.email} *</span><input name="email" type="email" value={values.email} onChange={update} maxLength={254} autoComplete="email" required /></label>
        <label><span>{copy.phone} *</span><input name="phone" type="tel" value={values.phone} onChange={update} maxLength={30} autoComplete="tel" required /></label>
        <label className="partner-application-field--wide"><span>{copy.regions} *</span><textarea name="serviceRegions" value={values.serviceRegions} onChange={update} maxLength={3000} rows={3} placeholder={copy.regionsHint} required /></label>
        <fieldset className="partner-application-choice-field partner-application-field--wide">
          <legend>{copy.vehicles} *</legend>
          <div className="transporter-vehicle-grid">
            {VEHICLE_KEYS.map((key, index) => (
              <label key={key} className="transporter-vehicle-option">
                <input type="checkbox" checked={values.vehicleTypes.includes(key)} onChange={() => toggleVehicle(key)} />
                <span>{vehicles[index]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label><span>{copy.vehicleCount} *</span><select name="vehicleCount" value={values.vehicleCount} onChange={update} required><option value="">{copy.choose}</option>{["1-5", "6-10", "11-25", "26-50", "50+"].map((value, index) => <option key={value} value={value}>{copy.vehicleCounts[index]}</option>)}</select></label>
        {yesNoField("offers24h", copy.allDay)}
        {yesNoField("offersFixedB2bPrice", copy.fixedPrice)}
        <label className="partner-application-field--wide"><span>{copy.notes}</span><textarea name="notes" value={values.notes} onChange={update} maxLength={3000} rows={3} placeholder={copy.notesHint} /></label>
      </div>

      <div className="partner-application-honeypot" aria-hidden="true"><label>Fax<input name="fax" value={values.fax} onChange={update} tabIndex={-1} autoComplete="off" /></label></div>
      <label className="partner-application-consent">
        <input name="privacyAccepted" type="checkbox" checked={values.privacyAccepted} onChange={update} required />
        <span>{copy.consent}{" "}<a href="/privacy-policy" target="_blank" rel="noreferrer">{copy.privacy}</a>{" · "}<a href="/terms-conditions" target="_blank" rel="noreferrer">{copy.terms}</a></span>
      </label>
      {error && <p className="partner-application-error" role="alert">{error}</p>}
      <button className="btn btn-gold partner-application-submit" type="submit" disabled={pending}>{pending ? copy.sending : copy.submit}</button>
    </form>
  );
}
