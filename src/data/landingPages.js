export const landingPages = [
  {
    slug: "istanbul-airport-vip-transfer",
    localizedSlugs: {
      tr: "istanbul-airport-vip-transfer",
      en: "istanbul-airport-vip-transfer",
      de: "flughafen-istanbul-vip-transfer",
    },
    legacySlugs: ["istanbul-airport-transfer"],
    xDefaultLang: "en",
    heroTitle: {
      en: "Istanbul Airport Transfer",
      tr: "İstanbul Havalimanı Transferi",
      de: "VIP-Transfer vom Flughafen Istanbul",
    },
    heroSubtitle: {
      en: "Premium meet & greet, flight tracking, and fixed-price transfers from IST.",
      tr: "IST'ten premium karşılama, uçuş takibi ve sabit fiyatlı transfer.",
      de: "Premium Meet-and-Greet, Flugverfolgung und Transfers zum Festpreis ab IST.",
    },
    fromPreset: { label: "Istanbul Airport (IST)", lng: 28.732, lat: 41.275 },
    toPreset: { label: "Taksim, Istanbul", lng: 28.978, lat: 41.037 },
    duration: { en: "45–60 min", tr: "45–60 dk", de: "45–60 Min." },
    highlights: {
      en: ["Flight monitoring", "60 min free waiting", "Meet & greet", "Fixed price"],
      tr: ["Uçuş takibi", "60 dk ücretsiz bekleme", "Karşılama hizmeti", "Sabit fiyat"],
      de: ["Flugverfolgung", "60 Minuten kostenlose Wartezeit", "Meet-and-Greet", "Festpreis"],
    },
  },
  {
    slug: "sabiha-gokcen-airport-transfer",
    heroTitle: {
      en: "Sabiha Gökçen Airport Transfer",
      tr: "Sabiha Gökçen Havalimanı Transferi",
      de: "Transfer vom Flughafen Sabiha Gökçen",
    },
    heroSubtitle: {
      en: "Reliable SAW airport transfers across Istanbul and beyond.",
      tr: "İstanbul ve çevresine güvenilir SAW havalimanı transferi.",
      de: "Zuverlässige Flughafentransfers ab SAW in ganz Istanbul und Umgebung.",
    },
    fromPreset: { label: "Istanbul Sabiha Gökçen (SAW)", lng: 29.309, lat: 40.899 },
    toPreset: { label: "Kadıköy, Istanbul", lng: 29.027, lat: 40.99 },
    duration: { en: "50–70 min", tr: "50–70 dk", de: "50–70 Min." },
    highlights: {
      en: ["Professional chauffeurs", "Luxury fleet", "24/7 support", "No surge pricing"],
      tr: ["Profesyonel şoförler", "Lüks araç filosu", "7/24 destek", "Yoğunluk zammı yok"],
      de: ["Professionelle Chauffeure", "Luxusflotte", "24/7 Unterstützung", "Keine Zuschläge bei hoher Nachfrage"],
    },
  },
  {
    slug: "istanbul-vip-transfer",
    heroTitle: { en: "Istanbul VIP Transfer", tr: "İstanbul VIP Transfer", de: "VIP-Transfer in Istanbul" },
    heroSubtitle: {
      en: "Executive chauffeur service for business and leisure across Istanbul.",
      tr: "İstanbul genelinde iş ve tatil için executive şoförlü transfer.",
      de: "Exklusiver Chauffeurservice für Geschäfts- und Urlaubsreisen in ganz Istanbul.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Beşiktaş, Istanbul", lng: 29.0, lat: 41.043 },
    duration: { en: "Flexible", tr: "Esnek", de: "Flexibel" },
    highlights: {
      en: ["Mercedes fleet", "Hourly hire", "Corporate accounts", "Multilingual drivers"],
      tr: ["Mercedes filosu", "Saatlik kiralama", "Kurumsal hesaplar", "Çok dilli şoförler"],
      de: ["Mercedes-Flotte", "Stundenweise Buchung", "Firmenkonten", "Mehrsprachige Chauffeure"],
    },
  },
  {
    slug: "istanbul-chauffeur-service",
    heroTitle: {
      en: "Istanbul Chauffeur Service",
      tr: "İstanbul Şoförlü Araç Kiralama",
      de: "Chauffeurservice in Istanbul",
    },
    heroSubtitle: {
      en: "Hourly and daily chauffeur hire with premium vehicles.",
      tr: "Premium araçlarla saatlik ve günlük şoförlü kiralama.",
      de: "Stunden- und tageweise Chauffeurfahrten mit Premiumfahrzeugen.",
    },
    bookingType: "hourly",
    duration: { en: "Min. 4 hours", tr: "En az 4 saat", de: "Mindestens 4 Stunden" },
    highlights: {
      en: ["Hourly packages", "City tours", "Business meetings", "Event transfers"],
      tr: ["Saatlik paketler", "Şehir turları", "İş toplantıları", "Etkinlik transferleri"],
      de: ["Stundenpakete", "Stadtrundfahrten", "Geschäftstermine", "Eventtransfers"],
    },
  },
  {
    slug: "istanbul-to-bursa-transfer",
    heroTitle: { en: "Istanbul to Bursa Transfer", tr: "İstanbul Bursa Transferi", de: "Transfer von Istanbul nach Bursa" },
    heroSubtitle: {
      en: "Comfortable intercity transfer with fixed pricing.",
      tr: "Sabit fiyatlı konforlu şehirlerarası transfer.",
      de: "Komfortabler Ferntransfer zum Festpreis.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Bursa", lng: 29.061, lat: 40.188 },
    duration: { en: "2.5–3 hours", tr: "2,5–3 saat", de: "2,5–3 Stunden" },
    highlights: {
      en: ["Door-to-door", "Luxury vans", "Rest stops on request", "Fixed quote"],
      tr: ["Kapıdan kapıya", "Lüks minibüsler", "İsteğe bağlı molalar", "Sabit fiyat teklifi"],
      de: ["Tür-zu-Tür-Service", "Luxusvans", "Pausen auf Wunsch", "Festes Angebot"],
    },
  },
  {
    slug: "istanbul-to-sapanca-transfer",
    heroTitle: { en: "Istanbul to Sapanca Transfer", tr: "İstanbul Sapanca Transferi", de: "Transfer von Istanbul nach Sapanca" },
    heroSubtitle: {
      en: "Scenic lake-side transfers from Istanbul to Sapanca.",
      tr: "İstanbul'dan Sapanca'ya göl manzaralı transfer.",
      de: "Komfortable Transfers von Istanbul in die malerische Seenregion Sapanca.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Sapanca", lng: 30.267, lat: 40.691 },
    duration: { en: "1.5–2 hours", tr: "1,5–2 saat", de: "1,5–2 Stunden" },
    highlights: {
      en: ["Weekend getaways", "Family-friendly vans", "Flexible pickup", "Premium service"],
      tr: ["Hafta sonu kaçamakları", "Ailelere uygun minibüsler", "Esnek alım noktası", "Premium hizmet"],
      de: ["Wochenendausflüge", "Familienfreundliche Vans", "Flexible Abholung", "Premiumservice"],
    },
  },
];

export function getLandingPage(slug) {
  return landingPages.find((page) =>
    page.slug === slug
    || Object.values(page.localizedSlugs || {}).includes(slug)
    || (page.legacySlugs || []).includes(slug)
  ) || null;
}

export function getLandingPageSlug(page, lang = "tr") {
  return page.localizedSlugs?.[lang] || page.slug;
}

export function getLandingPagePath(page, lang = "tr") {
  const slug = getLandingPageSlug(page, lang);
  return lang === "tr" ? `/${slug}` : `/${lang}/${slug}`;
}
