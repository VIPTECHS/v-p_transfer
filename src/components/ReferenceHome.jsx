import { useState } from "react";
import { ArrowRight, CarFront, Clock3, Globe2, Menu, X, UserRound, Luggage, Plane, ShieldCheck, MapPin, Smartphone, Check } from "lucide-react";
import BookingForm from "./BookingForm";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import Fleet from "./Fleet";
import Services from "./Services";
import Testimonials from "./Testimonials";
import AirportTransfer from "./AirportTransfer";
import About from "./About";
import Blog from "./Blog";
import Contact from "./Contact";
import StatsStrip from "./StatsStrip";
import Footer from "./Footer";
import WhatsAppCTA from "./WhatsAppCTA";
import { useI18n } from "../i18n/I18nContext";
import { PHONE, PHONE_DISPLAY, EMAIL, APP_STORE_URL, GOOGLE_PLAY_URL, WHATSAPP_URL, INSTAGRAM_URL, FACEBOOK_URL } from "../data/content";
import { landingPages, getLandingPagePath } from "../data/landingPages";
import { FLEET_SPECS } from "../utils/fleetSpecs";
import { useTheme } from "../lib/ThemeContext";
import { fleetDarkImages } from "../data/fleetDarkImages";
import "./reference-home.css";

const COPY = {
  tr: {
    airport: "Havalimanı transferi", city: "Şehirler arası", hourly: "Saatlik şoför", help: "Yardım", business: "Kurumsal", book: "Rezervasyon", menu: "Menüyü aç",
    title: "Dünyanın her yerinde güvenilir havalimanı transferi", subtitle: "Yolculuğunuz nerede başlarsa başlasın, transferiniz hazır.", promises: "Sabit fiyat · Özel araç · Profesyonel şoför", support: "7/24 yanınızdayız", supportNote: "Rezervasyondan varışa kadar",
    processEyebrow: "Rezervasyondan varışa", process: "Nasıl çalışır?", processSub: "Birkaç kolay adım. Daha rahat bir yolculuk.",
    steps: [["1. Transferinizi seçin", "Rotanızı ve aracınızı seçin, bilgilerinizi ekleyin ve rezervasyonunuzu tamamlayın."], ["2. Şoförünüzle buluşun", "Karşılama noktasında şoförünüzle buluşun. Bagajınızı bize bırakın."], ["3. Yolculuğun keyfini çıkarın", "Arkanıza yaslanın. Gideceğiniz yere kadar konforun tadını çıkarın."]],
    services: "Hizmetlerimiz", details: "Detaylar", servicesItems: [["Havalimanı transferi", "Yolculuğun ilk ve son adımında konforlu, özel transfer."], ["Profesyonel şoförler", "Deneyimli şoförlerimizle güvenli ve özenli bir yolculuk."], ["Saatlik şoför hizmeti", "İş veya tatil planlarınıza uyum sağlayan esnek hizmet."], ["Şehirler arası transfer", "İki şehir arasında, kapınızdan gideceğiniz yere kadar."]],
    fleet: "Yolculuğunuz için maksimum konfor ve güvenlik", fleetSub: "Özenle seçilmiş araçlar, profesyonel şoförler", similar: "veya benzeri", passengers: "yolcu", bags: "bagaj",
    reviews: "Yolcu yorumları", reviewHeadline: "Güzel bir yolculuk.", reviewSub: "Misafirlerimizin deneyimleri", reviewsItems: [["Sorunsuz bir karşılama", "Geciken uçuşumuzu takip eden şoförümüz bizi ismimizin yazdığı tabelayla bekliyordu.", "James M. · Londra"], ["Özenli ve konforlu", "Mercedes V-Class tertemizdi. Rezervasyondan varışa kadar profesyonel bir hizmet aldık.", "Ayşe K. · İstanbul"], ["Her şey planlandığı gibi", "Sabit fiyat, sürpriz yok. Havalimanından otelimize çok rahat bir yolculuk yaptık.", "Marco R. · Milano"]],
    destinations: "Destinasyonlar", destinationsSub: "Havalimanından şehre, yolculuğunuzun her noktasında.", all: "Tüm rotalar", app: "Yolculuğunuz elinizin altında.", appSub: "Transferinizi planlayın, rezervasyonunuzu yönetin ve rahatça yola çıkın.", download: "Uygulamayı keşfedin", appRoute: "Nereye gitmek istersiniz?", appUpcoming: "Bir sonraki yolculuğunuz", appConfirmed: "Rezervasyon onaylandı",
    footerTitle: "Bir sonraki yolculuğunuzu planlayın.", footerSub: "Rotanızı seçin, size uygun transferi bulun.", footerCta: "Fiyatları gör", company: "Şirket", topAirports: "Popüler havalimanları", contact: "7/24 Destek", rights: "Tüm hakları saklıdır.", links: ["Hakkımızda", "İş ortaklığı", "Taşımacı başvurusu", "Gizlilik politikası", "Kullanım koşulları"],
  },
  en: {
    airport: "Airport ride", city: "City rides", hourly: "Hourly service", help: "Help", business: "Business", book: "Book a ride", menu: "Open menu",
    title: "Your reliable worldwide airport transfers", subtitle: "Wherever your journey begins, your ride is ready.", promises: "Fixed price · Private vehicle · Professional drivers", support: "Here for you, 24/7", supportNote: "From booking to arrival",
    processEyebrow: "From booking to arrival", process: "How it works", processSub: "A few simple steps. A smoother journey.",
    steps: [["1. Book your ride", "Choose your route and vehicle, add your details and receive your booking confirmation."], ["2. Meet your driver", "Find your driver at the meeting point and let them take care of your luggage."], ["3. Enjoy your journey", "Settle in and enjoy a comfortable ride, all the way to your destination."]],
    services: "Core services", details: "Details", servicesItems: [["Airport transfers", "A comfortable private ride at the beginning and end of your trip."], ["Professional drivers", "Experienced chauffeurs. Thoughtful service. A relaxed journey."], ["Chauffeur by the hour", "A flexible chauffeur service for your business or leisure plans."], ["City rides", "From one city to the next, with door-to-door comfort."]],
    fleet: "Maximum comfort and safety for your trip", fleetSub: "Selected vehicles, professional drivers", similar: "or similar", passengers: "passengers", bags: "bags",
    reviews: "Reviews", reviewHeadline: "A journey well made.", reviewSub: "Experiences from our guests", reviewsItems: [["A seamless arrival", "Our driver tracked the delayed flight and waited with a name sign. A flawless airport pickup.", "James M. · London"], ["Comfortable and professional", "The Mercedes V-Class was spotless. Professional service from booking to drop-off.", "Ayşe K. · Istanbul"], ["Everything as promised", "Fixed price, no surprises. A comfortable journey all the way from the airport to our hotel.", "Marco R. · Milan"]],
    destinations: "Destinations", destinationsSub: "From the airport to the city, wherever your journey takes you.", all: "Explore routes", app: "Your journey. In your hands.", appSub: "Plan your transfer, manage your booking and enjoy the journey.", download: "Discover the app", appRoute: "Where would you like to go?", appUpcoming: "Your next journey", appConfirmed: "Booking confirmed",
    footerTitle: "Your next journey starts here.", footerSub: "Choose your route. Find your perfect ride.", footerCta: "See prices", company: "Company", topAirports: "Top airports", contact: "24/7 Support", rights: "All rights reserved.", links: ["About us", "Travel partners", "Become a driver partner", "Privacy policy", "Terms & conditions"],
  },
  de: {
    airport: "Flughafentransfer", city: "Städtefahrten", hourly: "Stundenservice", help: "Hilfe", business: "Geschäftskunden", book: "Fahrt buchen", menu: "Menü öffnen",
    title: "Ihr zuverlässiger Flughafentransfer weltweit", subtitle: "Wo Ihre Reise auch beginnt, Ihr Transfer steht bereit.", promises: "Festpreis · Privates Fahrzeug · Professionelle Chauffeure", support: "Rund um die Uhr für Sie da", supportNote: "Von der Buchung bis zur Ankunft",
    processEyebrow: "Von der Buchung bis zur Ankunft", process: "So funktioniert es", processSub: "Wenige Schritte. Eine entspannte Reise.",
    steps: [["1. Fahrt buchen", "Wählen Sie Ihre Route und Ihr Fahrzeug und schließen Sie Ihre Buchung ab."], ["2. Chauffeur treffen", "Ihr Chauffeur erwartet Sie am Treffpunkt und kümmert sich um Ihr Gepäck."], ["3. Reise genießen", "Lehnen Sie sich zurück und genießen Sie die Fahrt bis zu Ihrem Ziel."]],
    services: "Unsere Leistungen", details: "Details", servicesItems: [["Flughafentransfers", "Komfortable Privattransfers für den Anfang und das Ende Ihrer Reise."], ["Professionelle Chauffeure", "Erfahrene Fahrer und aufmerksamer Service für Ihre Reise."], ["Chauffeur nach Stunden", "Flexibler Service für Ihre Geschäfts- oder Urlaubspläne."], ["Städtefahrten", "Von einer Stadt zur nächsten, bequem von Tür zu Tür."]],
    fleet: "Maximaler Komfort und Sicherheit für Ihre Reise", fleetSub: "Ausgewählte Fahrzeuge, professionelle Chauffeure", similar: "oder ähnlich", passengers: "Passagiere", bags: "Gepäckstücke",
    reviews: "Bewertungen", reviewHeadline: "Eine gute Reise.", reviewSub: "Erfahrungen unserer Gäste", reviewsItems: [["Perfekte Abholung", "Unser Chauffeur verfolgte die Flugverspätung und wartete mit einem Namensschild.", "James M. · London"], ["Komfort und guter Service", "Die Mercedes V-Klasse war makellos. Professioneller Service von der Buchung bis zur Ankunft.", "Ayşe K. · Istanbul"], ["Alles wie versprochen", "Festpreis ohne Überraschungen. Eine entspannte Fahrt vom Flughafen bis zum Hotel.", "Marco R. · Mailand"]],
    destinations: "Reiseziele", destinationsSub: "Vom Flughafen in die Stadt, wohin Ihre Reise Sie auch führt.", all: "Routen entdecken", app: "Ihre Reise. In Ihrer Hand.", appSub: "Planen Sie Ihren Transfer und verwalten Sie Ihre Buchung ganz bequem.", download: "App entdecken", appRoute: "Wohin möchten Sie fahren?", appUpcoming: "Ihre nächste Reise", appConfirmed: "Buchung bestätigt",
    footerTitle: "Ihre nächste Reise beginnt hier.", footerSub: "Wählen Sie Ihre Route und finden Sie Ihren Transfer.", footerCta: "Preise ansehen", company: "Unternehmen", topAirports: "Beliebte Flughäfen", contact: "24/7 Unterstützung", rights: "Alle Rechte vorbehalten.", links: ["Über uns", "Reisepartner", "Fahrerpartner werden", "Datenschutz", "Geschäftsbedingungen"],
  },
};

const SERVICE_IMAGES = ["Airport-Transfer.png", "Chauffeur-driven-Car.jpg", "Airport-Taxi.jpg", "Intercity-Routes.jpg"];
const SERVICE_PATHS = ["/airport-transfer", "/chauffeur-service", "/istanbul-chauffeur-service", "/intercity-routes"];
const FLEET_ORDER = ["eClass", "sClass", "maybach", "vClassStandard", "vClassLux", "vClassUltraLux", "sprinterStandard", "sprinterUltraLux"];
const FLEET_IMAGES = { eClass: "/images/fleet/e-class.png", sClass: "/images/fleet/s-class.png", maybach: "/images/fleet/maybach.png", vClassStandard: "/images/fleet/v-class-standard.png", vClassLux: "/images/fleet/v-class-lux.png", vClassUltraLux: "/images/fleet/v-class-ultra-lux.png", sprinterStandard: "/images/fleet/sprinter-standard.png", sprinterUltraLux: "/images/fleet/sprinter-ultra-lux.png" };
const FLEET_CAPACITY = Object.fromEntries(Object.entries(FLEET_SPECS).map(([key, spec]) => [key, spec.passengerCap]));
const DESTINATION_SLUGS = ["istanbul-airport-vip-transfer", "sabiha-gokcen-airport-transfer", "istanbul-to-bursa-transfer", "istanbul-to-sapanca-transfer", "istanbul-vip-transfer", "istanbul-chauffeur-service"];
const DESTINATION_NAMES = ["İstanbul", "Sabiha Gökçen", "Bursa", "Sapanca", "İstanbul", "İstanbul"];

function JourneyIllustration({ step }) {
  const { theme } = useTheme();
  const images = theme === "dark" ? fleetDarkImages : FLEET_IMAGES;
  if (step === 0) return <div className="rh-step-art rh-step-art--booking" aria-hidden="true"><div className="rh-mini-booking"><div className="rh-mini-route"><span>○ İstanbul Airport</span><span>● Taksim, İstanbul</span></div>{["eClass", "vClassStandard", "sprinterStandard"].map((key) => <div className="rh-mini-car" key={key}><img src={images[key]} alt="" /><div><strong>{key === "eClass" ? "Business Sedan" : key === "vClassStandard" ? "VIP Van" : "Minibus"}</strong><span><UserRound size={10} /> {FLEET_CAPACITY[key]} <Luggage size={10} /> {FLEET_CAPACITY[key]}</span></div><Check size={15} /></div>)}</div></div>;
  if (step === 1) return <div className="rh-step-art rh-step-art--meet" aria-hidden="true"><div className="rh-arrivals"><span>Arrivals <small>13:36</small></span><strong>TK 1980 · LONDON · LANDED</strong><strong>TK 1824 · PARIS · 13:50</strong><strong>TK 1630 · MUNICH · 14:05</strong></div><div className="rh-name-board"><CarFront size={20} /><strong>Ms. &amp; Mr. Leblebicioğlu</strong><span>IST · International arrivals</span></div></div>;
  const route = "M63.5 310V209H193.5V139H258.5V69";
  return (
    <div className="rh-step-art rh-step-art--map" aria-hidden="true">
      <svg viewBox="0 0 360 420" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="rh-city-blocks" width="65" height="70" patternUnits="userSpaceOnUse">
            <rect x="5" y="5" width="52" height="58" rx="4" fill="#dcdcd7" stroke="#d3d3ce" />
          </pattern>
        </defs>
        <rect width="360" height="420" fill="#edede8" />
        <rect width="360" height="420" fill="url(#rh-city-blocks)" />
        <path d={route} fill="none" stroke="#ffc252" strokeWidth="10" strokeLinejoin="round" opacity=".2" />
        <path d={route} fill="none" stroke="#f5b63d" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="258.5" cy="69" r="7" fill="#f5b63d" />
        <circle cx="193.5" cy="180" r="7" fill="white" stroke="#171716" strokeWidth="4" />
        <g transform="translate(63.5 310)" color="#fff">
          <circle r="15" fill="#171716" />
          <Plane x={-6.5} y={-6.5} size={13} />
        </g>
      </svg>
      <div className="rh-map-caption"><strong>Taksim, İstanbul</strong><span>45 min · 38 km</span></div>
    </div>
  );
}

export default function ReferenceHome({ onSearch, navigate }) {
  const { lang, t } = useI18n();
  const copy = COPY[lang] || COPY.en;
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const paths = ["/about-us", "/travel-partners", "/transporter-application", "/privacy-policy", "/terms-conditions"];
  const go = (event, path) => { event.preventDefault(); setMenuOpen(false); navigate(path); };
  const book = () => { setMenuOpen(false); document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "center" }); document.getElementById("from-where")?.focus({ preventScroll: true }); };
  const destinations = DESTINATION_SLUGS.map((slug, index) => ({ page: landingPages.find((page) => page.slug === slug), name: DESTINATION_NAMES[index] })).filter(({ page }) => page);
  return (
    <div className="rh-page">
      <section className="rh-hero" id="home">
        <img className="rh-hero-image" src="/images/home-hero-maybach.jpg" alt="" fetchPriority="high" />
        <header className="rh-header rh-container">
          <a className="rh-brand" href="#top" aria-label="VIP Transfer"><img src="/images/viptransfer-logo.png" alt="VIP Transfer" /></a>
          <nav id="rh-mobile-nav" className={`rh-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            <a className="is-active" href="#booking" onClick={() => setMenuOpen(false)}>{copy.airport}</a>
            <a href="/intercity-routes" onClick={(event) => go(event, "/intercity-routes")}>{copy.city}</a>
            <a href="/istanbul-chauffeur-service" onClick={(event) => go(event, "/istanbul-chauffeur-service")}>{copy.hourly}</a>
            <a href="/yardim" onClick={(event) => go(event, "/yardim")}>{copy.help}</a>
            <details className="rh-dropdown"><summary>{copy.business} <span>⌄</span></summary><div><a href="#corporate" onClick={() => setMenuOpen(false)}>{copy.links[0]}</a><a href="#blog" onClick={() => setMenuOpen(false)}>Blog</a><a href="/medyada-biz" onClick={(event) => go(event, "/medyada-biz")}>{t("nav.media")}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{t("footer.columns.corporate.links.contact")}</a><a href="/partner-application" onClick={(event) => go(event, "/partner-application")}>{t("contact.agency.cta")}</a><a href="/corporate-accounts" onClick={(event) => go(event, "/corporate-accounts")}>{copy.business}</a><a href="/travel-partners" onClick={(event) => go(event, "/travel-partners")}>{copy.links[1]}</a><a href="/transporter-application" onClick={(event) => go(event, "/transporter-application")}>{copy.links[2]}</a></div></details>
          </nav>
          <div className="rh-header-actions"><ThemeToggle /><details className="rh-dropdown rh-language"><summary><Globe2 size={16} /> {lang.toUpperCase()} <span>⌄</span></summary><div><LanguageSwitcher /></div></details><button type="button" className="rh-header-book" onClick={() => onSearch({ type: "transfer" })}><UserRound size={16} />{copy.book}</button><button type="button" className="rh-menu" aria-label={copy.menu} aria-expanded={menuOpen} aria-controls="rh-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
        </header>
        <div className="rh-hero-content rh-container">
          <div className="rh-hero-copy"><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
          <BookingForm visible layout="reference" onSearch={onSearch} />
          <div className="rh-hero-trust"><span>{copy.promises}</span><a href={`tel:${PHONE}`}><ShieldCheck size={19} /><strong>{copy.support}</strong><span>{copy.supportNote}</span></a></div>
        </div>
      </section>
      <main>
        <StatsStrip />
        <section className="rh-section rh-container" aria-labelledby="rh-process-title">
          <p className="rh-eyebrow">{copy.processEyebrow}</p><div className="rh-section-heading"><h2 id="rh-process-title">{copy.process}</h2><p>{copy.processSub}</p></div>
          <div className="rh-process-grid">{copy.steps.map(([title, description], index) => <article key={title}><JourneyIllustration step={index} /><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>
        <Services />
        <div className="rh-restored-fleet"><Fleet onSearch={onSearch} imageOverrides={FLEET_IMAGES} initiallyExpanded /></div>
        <Testimonials />
        <section className="rh-section rh-container rh-destinations" id="destinations" aria-labelledby="rh-destinations-title"><div className="rh-section-heading"><div><h2 id="rh-destinations-title">{copy.destinations}</h2><p>{copy.destinationsSub}</p></div><a href="#rh-destination-list" className="rh-text-link">{copy.all}<ArrowRight size={16} /></a></div><div className="rh-four-grid">{destinations.slice(0, 4).map(({ page, name }, index) => <a className={`rh-destination rh-destination--${index}`} key={page.slug} href={getLandingPagePath(page, lang)} onClick={(event) => go(event, getLandingPagePath(page, lang))}><img src={index === 0 ? "/images/blog/istanbul-airport.jpg" : index === 1 ? "/images/services/Airport-Transfer.png" : index === 2 ? "/images/services/Intercity-Routes.jpg" : "/images/services/Airport-Shuttle.jpg"} alt="" loading="lazy" /><div><h3>{name}</h3><p>{page.heroTitle[lang] || page.heroTitle.en}</p></div></a>)}</div><div className="rh-destination-list" id="rh-destination-list">{destinations.map(({ page, name }) => <a key={page.slug} href={getLandingPagePath(page, lang)} onClick={(event) => go(event, getLandingPagePath(page, lang))}><div><strong>{name}</strong><span>{page.heroTitle[lang] || page.heroTitle.en}</span></div><ArrowRight size={15} /></a>)}</div></section>
        <AirportTransfer />
        <About />
        <Blog navigate={navigate} />
        <Contact />
        <section className="rh-container rh-app-wrap"><div className="rh-app"><div className="rh-app-copy"><h2>{copy.app}</h2><p>{copy.appSub}</p><span>{copy.download}</span><div className="rh-app-badges"><a href={APP_STORE_URL} target="_blank" rel="noreferrer"><Smartphone size={24} /><span>Download on the<strong>App Store</strong></span></a><a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer"><span className="rh-play">▶</span><span>GET IT ON<strong>Google Play</strong></span></a></div></div><div className="rh-phone" aria-hidden="true"><div className="rh-phone-notch" /><div className="rh-phone-time">9:41 <span>● ▰</span></div><strong className="rh-phone-brand">VIPTRANSFER</strong><p>{copy.appRoute}</p><div className="rh-phone-search"><MapPin size={16} /> İstanbul Airport</div><div className="rh-phone-options"><span><Plane />{copy.airport}</span><span><Clock3 />{copy.hourly}</span></div><h3>{copy.appUpcoming}</h3><div className="rh-phone-trip"><span><Check size={12} />{copy.appConfirmed}</span><strong>İstanbul Airport</strong><small>↓</small><strong>Taksim, İstanbul</strong><img src={theme === "dark" ? fleetDarkImages.vClassStandard : "/images/fleet/v-class-standard.png"} alt="" /></div></div></div></section>
      </main>
      <Footer navigate={navigate} />
      <WhatsAppCTA />
    </div>
  );
}
