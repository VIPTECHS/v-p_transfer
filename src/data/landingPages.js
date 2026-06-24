export const landingPages = [
  {
    slug: "istanbul-airport-transfer",
    heroTitle: { en: "Istanbul Airport Transfer", tr: "İstanbul Havalimanı Transferi" },
    heroSubtitle: {
      en: "Premium meet & greet, flight tracking, and fixed-price transfers from IST.",
      tr: "IST'ten premium karşılama, uçuş takibi ve sabit fiyatlı transfer.",
    },
    fromPreset: { label: "Istanbul Airport (IST)", lng: 28.732, lat: 41.275 },
    toPreset: { label: "Taksim, Istanbul", lng: 28.978, lat: 41.037 },
    duration: "45–60 min",
    highlights: ["Flight monitoring", "60 min free waiting", "Meet & greet", "Fixed price"],
  },
  {
    slug: "sabiha-gokcen-airport-transfer",
    heroTitle: { en: "Sabiha Gökçen Airport Transfer", tr: "Sabiha Gökçen Havalimanı Transferi" },
    heroSubtitle: {
      en: "Reliable SAW airport transfers across Istanbul and beyond.",
      tr: "İstanbul ve çevresine güvenilir SAW havalimanı transferi.",
    },
    fromPreset: { label: "Istanbul Sabiha Gökçen (SAW)", lng: 29.309, lat: 40.899 },
    toPreset: { label: "Kadıköy, Istanbul", lng: 29.027, lat: 40.99 },
    duration: "50–70 min",
    highlights: ["Professional chauffeurs", "Luxury fleet", "24/7 support", "No surge pricing"],
  },
  {
    slug: "istanbul-vip-transfer",
    heroTitle: { en: "Istanbul VIP Transfer", tr: "İstanbul VIP Transfer" },
    heroSubtitle: {
      en: "Executive chauffeur service for business and leisure across Istanbul.",
      tr: "İstanbul genelinde iş ve tatil için executive şoförlü transfer.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Beşiktaş, Istanbul", lng: 29.0, lat: 41.043 },
    duration: "Flexible",
    highlights: ["Mercedes fleet", "Hourly hire", "Corporate accounts", "Multilingual drivers"],
  },
  {
    slug: "istanbul-chauffeur-service",
    heroTitle: { en: "Istanbul Chauffeur Service", tr: "İstanbul Şoförlü Araç Kiralama" },
    heroSubtitle: {
      en: "Hourly and daily chauffeur hire with premium vehicles.",
      tr: "Premium araçlarla saatlik ve günlük şoförlü kiralama.",
    },
    bookingType: "hourly",
    duration: "Min. 4 hours",
    highlights: ["Hourly packages", "City tours", "Business meetings", "Event transfers"],
  },
  {
    slug: "istanbul-to-bursa-transfer",
    heroTitle: { en: "Istanbul to Bursa Transfer", tr: "İstanbul Bursa Transferi" },
    heroSubtitle: {
      en: "Comfortable intercity transfer with fixed pricing.",
      tr: "Sabit fiyatlı konforlu şehirlerarası transfer.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Bursa", lng: 29.061, lat: 40.188 },
    duration: "2.5–3 hours",
    highlights: ["Door-to-door", "Luxury vans", "Rest stops on request", "Fixed quote"],
  },
  {
    slug: "istanbul-to-sapanca-transfer",
    heroTitle: { en: "Istanbul to Sapanca Transfer", tr: "İstanbul Sapanca Transferi" },
    heroSubtitle: {
      en: "Scenic lake-side transfers from Istanbul to Sapanca.",
      tr: "İstanbul'dan Sapanca'ya göl manzaralı transfer.",
    },
    fromPreset: { label: "Istanbul", lng: 28.978, lat: 41.008 },
    toPreset: { label: "Sapanca", lng: 30.267, lat: 40.691 },
    duration: "1.5–2 hours",
    highlights: ["Weekend getaways", "Family-friendly vans", "Flexible pickup", "Premium service"],
  },
];

export function getLandingPage(slug) {
  return landingPages.find((p) => p.slug === slug) || null;
}
