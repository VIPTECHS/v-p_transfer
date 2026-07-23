import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n/I18nContext";
import { searchPlaces } from "../utils/geocode";

const LocationMapPopover = lazy(() => import("./LocationMapPopover"));

/** @typedef {{ label: string, lng: number, lat: number }} LocationPoint */

const POPULAR_AIRPORTS = [
  {
    label: "Dubai Havalimanı (DXB)",
    city: "Dubai",
    code: "DXB",
    lng: 55.3657,
    lat: 25.2532,
    aliases: ["dubai airport", "dxb airport"],
  },
  {
    label: "İstanbul Havalimanı (IST)",
    city: "İstanbul",
    code: "IST",
    lng: 28.7519,
    lat: 41.2753,
    aliases: ["istanbul airport", "ist airport"],
  },
  {
    label: "Sabiha Gökçen Havalimanı (SAW)",
    city: "İstanbul",
    code: "SAW",
    lng: 29.3092,
    lat: 40.8986,
    aliases: ["sabiha gokcen", "sabiha gökçen", "saw airport"],
  },
  {
    label: "Antalya Havalimanı (AYT)",
    city: "Antalya",
    code: "AYT",
    lng: 30.8005,
    lat: 36.8987,
    aliases: ["antalya airport", "ayt airport"],
  },
  {
    label: "Paris Charles de Gaulle Havalimanı (CDG)",
    city: "Paris",
    code: "CDG",
    lng: 2.55,
    lat: 49.0097,
    aliases: ["paris airport", "charles de gaulle", "cdg airport"],
  },
  {
    label: "Nice Côte d'Azur Havalimanı (NCE)",
    city: "Nice",
    code: "NCE",
    lng: 7.2159,
    lat: 43.6653,
    aliases: ["nice airport", "nce airport", "cote d azur"],
  },
  { label: "London Heathrow Airport (LHR)", city: "London", code: "LHR", lng: -0.4543, lat: 51.47, aliases: ["heathrow airport", "london heathrow"] },
  { label: "New York John F. Kennedy Airport (JFK)", city: "New York", code: "JFK", lng: -73.7781, lat: 40.6413, aliases: ["john f kennedy airport", "new york jfk"] },
  { label: "Los Angeles International Airport (LAX)", city: "Los Angeles", code: "LAX", lng: -118.4085, lat: 33.9416, aliases: ["los angeles airport", "lax airport"] },
  { label: "Singapore Changi Airport (SIN)", city: "Singapore", code: "SIN", lng: 103.9915, lat: 1.3644, aliases: ["changi airport", "singapore airport"] },
  { label: "Tokyo Haneda Airport (HND)", city: "Tokyo", code: "HND", lng: 139.7798, lat: 35.5494, aliases: ["haneda airport", "tokyo haneda"] },
  { label: "Tokyo Narita Airport (NRT)", city: "Tokyo", code: "NRT", lng: 140.3929, lat: 35.772, aliases: ["narita airport", "tokyo narita"] },
  { label: "Seoul Incheon Airport (ICN)", city: "Seoul", code: "ICN", lng: 126.4407, lat: 37.4602, aliases: ["incheon airport", "seoul airport"] },
  { label: "Beijing Capital Airport (PEK)", city: "Beijing", code: "PEK", lng: 116.5974, lat: 40.0799, aliases: ["beijing airport", "capital airport"] },
  { label: "Shanghai Pudong Airport (PVG)", city: "Shanghai", code: "PVG", lng: 121.8052, lat: 31.1443, aliases: ["pudong airport", "shanghai airport"] },
  { label: "Hong Kong International Airport (HKG)", city: "Hong Kong", code: "HKG", lng: 113.9185, lat: 22.308, aliases: ["hong kong airport", "chek lap kok"] },
  { label: "Bangkok Suvarnabhumi Airport (BKK)", city: "Bangkok", code: "BKK", lng: 100.7501, lat: 13.69, aliases: ["bangkok airport", "suvarnabhumi"] },
  { label: "Kuala Lumpur International Airport (KUL)", city: "Kuala Lumpur", code: "KUL", lng: 101.7099, lat: 2.7456, aliases: ["kuala lumpur airport", "klia"] },
  { label: "Doha Hamad International Airport (DOH)", city: "Doha", code: "DOH", lng: 51.6081, lat: 25.2731, aliases: ["doha airport", "hamad airport"] },
  { label: "Abu Dhabi International Airport (AUH)", city: "Abu Dhabi", code: "AUH", lng: 54.6511, lat: 24.4539, aliases: ["abu dhabi airport", "zayed airport"] },
  { label: "Amsterdam Schiphol Airport (AMS)", city: "Amsterdam", code: "AMS", lng: 4.7639, lat: 52.3105, aliases: ["schiphol airport", "amsterdam airport"] },
  { label: "Frankfurt Airport (FRA)", city: "Frankfurt", code: "FRA", lng: 8.5622, lat: 50.0379, aliases: ["frankfurt airport"] },
  { label: "Munich Airport (MUC)", city: "Munich", code: "MUC", lng: 11.7861, lat: 48.3538, aliases: ["munich airport"] },
  { label: "Zurich Airport (ZRH)", city: "Zurich", code: "ZRH", lng: 8.5492, lat: 47.4581, aliases: ["zurich airport"] },
  { label: "Madrid Barajas Airport (MAD)", city: "Madrid", code: "MAD", lng: -3.5676, lat: 40.4983, aliases: ["madrid airport", "barajas"] },
  { label: "Barcelona El Prat Airport (BCN)", city: "Barcelona", code: "BCN", lng: 2.0785, lat: 41.2974, aliases: ["barcelona airport", "el prat"] },
  { label: "Rome Fiumicino Airport (FCO)", city: "Rome", code: "FCO", lng: 12.2508, lat: 41.8003, aliases: ["rome airport", "fiumicino"] },
  { label: "Milan Malpensa Airport (MXP)", city: "Milan", code: "MXP", lng: 8.7231, lat: 45.63, aliases: ["milan airport", "malpensa"] },
  { label: "Vienna International Airport (VIE)", city: "Vienna", code: "VIE", lng: 16.5697, lat: 48.1103, aliases: ["vienna airport"] },
  { label: "Copenhagen Airport (CPH)", city: "Copenhagen", code: "CPH", lng: 12.6508, lat: 55.618, aliases: ["copenhagen airport", "kastrup"] },
  { label: "Dublin Airport (DUB)", city: "Dublin", code: "DUB", lng: -6.2701, lat: 53.4213, aliases: ["dublin airport"] },
  { label: "Lisbon Airport (LIS)", city: "Lisbon", code: "LIS", lng: -9.1359, lat: 38.7742, aliases: ["lisbon airport", "humberto delgado"] },
  { label: "Athens Airport (ATH)", city: "Athens", code: "ATH", lng: 23.9445, lat: 37.9364, aliases: ["athens airport"] },
  { label: "Manchester Airport (MAN)", city: "Manchester", code: "MAN", lng: -2.275, lat: 53.3537, aliases: ["manchester airport"] },
  { label: "Delhi Indira Gandhi Airport (DEL)", city: "Delhi", code: "DEL", lng: 77.1025, lat: 28.5562, aliases: ["delhi airport", "indira gandhi"] },
  { label: "Mumbai Chhatrapati Shivaji Airport (BOM)", city: "Mumbai", code: "BOM", lng: 72.8747, lat: 19.0896, aliases: ["mumbai airport", "bombay airport"] },
  { label: "Sydney Kingsford Smith Airport (SYD)", city: "Sydney", code: "SYD", lng: 151.1772, lat: -33.9399, aliases: ["sydney airport", "kingsford smith"] },
  { label: "Melbourne Airport (MEL)", city: "Melbourne", code: "MEL", lng: 144.843, lat: -37.6733, aliases: ["melbourne airport", "tullamarine"] },
  { label: "Toronto Pearson Airport (YYZ)", city: "Toronto", code: "YYZ", lng: -79.6248, lat: 43.6777, aliases: ["toronto airport", "pearson"] },
  { label: "Vancouver International Airport (YVR)", city: "Vancouver", code: "YVR", lng: -123.1779, lat: 49.1967, aliases: ["vancouver airport"] },
  { label: "Miami International Airport (MIA)", city: "Miami", code: "MIA", lng: -80.287, lat: 25.7959, aliases: ["miami airport"] },
  { label: "Chicago O'Hare Airport (ORD)", city: "Chicago", code: "ORD", lng: -87.9073, lat: 41.9742, aliases: ["chicago airport", "ohare", "o hare"] },
  { label: "Atlanta Hartsfield-Jackson Airport (ATL)", city: "Atlanta", code: "ATL", lng: -84.4277, lat: 33.6407, aliases: ["atlanta airport", "hartsfield jackson"] },
  { label: "San Francisco International Airport (SFO)", city: "San Francisco", code: "SFO", lng: -122.379, lat: 37.6213, aliases: ["san francisco airport"] },
  { label: "Las Vegas Harry Reid Airport (LAS)", city: "Las Vegas", code: "LAS", lng: -115.1537, lat: 36.084, aliases: ["las vegas airport", "harry reid"] },
  { label: "Dallas Fort Worth Airport (DFW)", city: "Dallas", code: "DFW", lng: -97.0403, lat: 32.8998, aliases: ["dallas airport", "fort worth airport"] },
  { label: "Seattle Tacoma Airport (SEA)", city: "Seattle", code: "SEA", lng: -122.3088, lat: 47.4502, aliases: ["seattle airport", "seatac"] },
  { label: "Mexico City Airport (MEX)", city: "Mexico City", code: "MEX", lng: -99.0721, lat: 19.4361, aliases: ["mexico city airport"] },
  { label: "São Paulo Guarulhos Airport (GRU)", city: "São Paulo", code: "GRU", lng: -46.4731, lat: -23.4356, aliases: ["sao paulo airport", "guarulhos"] },
  { label: "Buenos Aires Ezeiza Airport (EZE)", city: "Buenos Aires", code: "EZE", lng: -58.5358, lat: -34.8222, aliases: ["buenos aires airport", "ezeiza"] },
  { label: "Cairo International Airport (CAI)", city: "Cairo", code: "CAI", lng: 31.4056, lat: 30.1219, aliases: ["cairo airport"] },
];

const TURKEY_AIRPORTS = [
  { label: "Ankara Esenboğa Havalimanı (ESB)", city: "Ankara", code: "ESB", lng: 32.9951, lat: 40.1281, aliases: ["esenboga", "esenboğa", "ankara airport"] },
  { label: "Adana Şakirpaşa Havalimanı (ADA)", city: "Adana", code: "ADA", lng: 35.2804, lat: 36.9822, aliases: ["adana airport", "sakirpasa", "şakirpaşa"] },
  { label: "Çukurova Havalimanı (COV)", city: "Tarsus", code: "COV", lng: 35.0712, lat: 36.8915, aliases: ["cukurova", "çukurova", "mersin airport", "adana airport"] },
  { label: "Gaziantep Oğuzeli Havalimanı (GZT)", city: "Gaziantep", code: "GZT", lng: 37.4787, lat: 36.9472, aliases: ["gaziantep airport", "oguzeli", "oğuzeli"] },
  { label: "Kastamonu Havalimanı (KFS)", city: "Kastamonu", code: "KFS", lng: 33.7958, lat: 41.3142, aliases: ["kastamonu airport"] },
  { label: "Konya Havalimanı (KYA)", city: "Konya", code: "KYA", lng: 32.5619, lat: 37.979, aliases: ["konya airport"] },
  { label: "Amasya Merzifon Havalimanı (MZH)", city: "Amasya", code: "MZH", lng: 35.522, lat: 40.8294, aliases: ["amasya airport", "merzifon"] },
  { label: "Sivas Nuri Demirağ Havalimanı (VAS)", city: "Sivas", code: "VAS", lng: 36.9035, lat: 39.8138, aliases: ["sivas airport", "nuri demirag", "nuri demirağ"] },
  { label: "Zonguldak Çaycuma Havalimanı (ONQ)", city: "Zonguldak", code: "ONQ", lng: 32.0886, lat: 41.5064, aliases: ["zonguldak airport", "caycuma", "çaycuma"] },
  { label: "Malatya Erhaç Havalimanı (MLX)", city: "Malatya", code: "MLX", lng: 38.091, lat: 38.4353, aliases: ["malatya airport", "erhac", "erhaç"] },
  { label: "Kayseri Erkilet Havalimanı (ASR)", city: "Kayseri", code: "ASR", lng: 35.4954, lat: 38.7704, aliases: ["kayseri airport", "erkilet"] },
  { label: "Tokat Havalimanı (TJK)", city: "Tokat", code: "TJK", lng: 36.3906, lat: 40.3247, aliases: ["tokat airport"] },
  { label: "Denizli Çardak Havalimanı (DNZ)", city: "Denizli", code: "DNZ", lng: 29.7013, lat: 37.7856, aliases: ["denizli airport", "cardak", "çardak"] },
  { label: "Nevşehir Kapadokya Havalimanı (NAV)", city: "Nevşehir", code: "NAV", lng: 34.5345, lat: 38.7719, aliases: ["nevsehir", "nevşehir", "kapadokya", "cappadocia airport"] },
  { label: "İstanbul Atatürk Havalimanı (ISL)", city: "İstanbul", code: "ISL", lng: 28.8237, lat: 40.9719, aliases: ["atatürk airport", "ataturk airport"] },
  { label: "Aydın Çıldır Havalimanı (CII)", city: "Aydın", code: "CII", lng: 27.8876, lat: 37.8154, aliases: ["aydin", "aydın", "cildir", "çıldır"] },
  { label: "Balıkesir Havalimanı (BZI)", city: "Balıkesir", code: "BZI", lng: 27.926, lat: 39.6193, aliases: ["balikesir", "balıkesir airport"] },
  { label: "Bandırma Havalimanı (BDM)", city: "Bandırma", code: "BDM", lng: 27.9777, lat: 40.318, aliases: ["bandirma", "bandırma airport"] },
  { label: "Çanakkale Havalimanı (CKZ)", city: "Çanakkale", code: "CKZ", lng: 26.4268, lat: 40.1377, aliases: ["canakkale", "çanakkale airport"] },
  { label: "İzmir Adnan Menderes Havalimanı (ADB)", city: "İzmir", code: "ADB", lng: 27.157, lat: 38.2924, aliases: ["adnan menderes", "izmir airport"] },
  { label: "Uşak Havalimanı (USQ)", city: "Uşak", code: "USQ", lng: 29.4717, lat: 38.6815, aliases: ["usak", "uşak airport"] },
  { label: "Kocaeli Cengiz Topel Havalimanı (KCO)", city: "Kocaeli", code: "KCO", lng: 30.0833, lat: 40.735, aliases: ["kocaeli airport", "cengiz topel"] },
  { label: "Bursa Yenişehir Havalimanı (YEI)", city: "Bursa", code: "YEI", lng: 29.5626, lat: 40.2552, aliases: ["bursa airport", "yenisehir", "yenişehir"] },
  { label: "Dalaman Havalimanı (DLM)", city: "Dalaman", code: "DLM", lng: 28.7925, lat: 36.7131, aliases: ["dalaman airport", "mugla", "muğla"] },
  { label: "Tekirdağ Çorlu Havalimanı (TEQ)", city: "Tekirdağ", code: "TEQ", lng: 27.9191, lat: 41.1382, aliases: ["tekirdag", "tekirdağ", "corlu", "çorlu"] },
  { label: "Bodrum İmsık Havalimanı (BXN)", city: "Bodrum", code: "BXN", lng: 27.6697, lat: 37.1401, aliases: ["bodrum imsik", "bodrum imşık"] },
  { label: "Eskişehir Hasan Polatkan Havalimanı (AOE)", city: "Eskişehir", code: "AOE", lng: 30.5193, lat: 39.8116, aliases: ["eskisehir", "eskişehir", "hasan polatkan"] },
  { label: "Zafer Havalimanı (KZR)", city: "Kütahya", code: "KZR", lng: 30.1304, lat: 39.1111, aliases: ["kutahya", "kütahya", "afyon", "usak", "uşak"] },
  { label: "Elazığ Havalimanı (EZS)", city: "Elazığ", code: "EZS", lng: 39.2835, lat: 38.598, aliases: ["elazig", "elazığ airport"] },
  { label: "Ordu Giresun Havalimanı (OGU)", city: "Ordu", code: "OGU", lng: 38.086, lat: 40.9669, aliases: ["ordu airport", "giresun airport"] },
  { label: "Diyarbakır Havalimanı (DIY)", city: "Diyarbakır", code: "DIY", lng: 40.201, lat: 37.8939, aliases: ["diyarbakir", "diyarbakır airport"] },
  { label: "Erzincan Havalimanı (ERC)", city: "Erzincan", code: "ERC", lng: 39.527, lat: 39.7102, aliases: ["erzincan airport"] },
  { label: "Erzurum Havalimanı (ERZ)", city: "Erzurum", code: "ERZ", lng: 41.1702, lat: 39.9565, aliases: ["erzurum airport"] },
  { label: "Kars Harakani Havalimanı (KSY)", city: "Kars", code: "KSY", lng: 43.115, lat: 40.5622, aliases: ["kars airport", "harakani"] },
  { label: "Trabzon Havalimanı (TZX)", city: "Trabzon", code: "TZX", lng: 39.7897, lat: 40.9951, aliases: ["trabzon airport"] },
  { label: "Van Ferit Melen Havalimanı (VAN)", city: "Van", code: "VAN", lng: 43.3323, lat: 38.4682, aliases: ["van airport", "ferit melen"] },
  { label: "Batman Havalimanı (BAL)", city: "Batman", code: "BAL", lng: 41.1166, lat: 37.929, aliases: ["batman airport"] },
  { label: "Muş Sultan Alparslan Havalimanı (MSR)", city: "Muş", code: "MSR", lng: 41.6612, lat: 38.7478, aliases: ["mus", "muş airport", "sultan alparslan"] },
  { label: "Siirt Havalimanı (SXZ)", city: "Siirt", code: "SXZ", lng: 41.8404, lat: 37.9789, aliases: ["siirt airport"] },
  { label: "Sinop Havalimanı (NOP)", city: "Sinop", code: "NOP", lng: 35.0718, lat: 42.0183, aliases: ["sinop airport"] },
  { label: "Kahramanmaraş Havalimanı (KCM)", city: "Kahramanmaraş", code: "KCM", lng: 36.9535, lat: 37.5388, aliases: ["maras", "maraş", "kahramanmaras"] },
  { label: "Ağrı Ahmed-i Hani Havalimanı (AJI)", city: "Ağrı", code: "AJI", lng: 43.0257, lat: 39.6556, aliases: ["agri", "ağrı airport"] },
  { label: "Adıyaman Havalimanı (ADF)", city: "Adıyaman", code: "ADF", lng: 38.4689, lat: 37.7314, aliases: ["adiyaman", "adıyaman airport"] },
  { label: "Mardin Havalimanı (MQM)", city: "Mardin", code: "MQM", lng: 40.6317, lat: 37.2233, aliases: ["mardin airport"] },
  { label: "Şanlıurfa GAP Havalimanı (GNY)", city: "Şanlıurfa", code: "GNY", lng: 38.8956, lat: 37.4457, aliases: ["sanliurfa", "şanlıurfa", "urfa", "gap airport"] },
  { label: "Iğdır Havalimanı (IGD)", city: "Iğdır", code: "IGD", lng: 43.8766, lat: 39.9766, aliases: ["igdir", "ığdır airport"] },
  { label: "Bingöl Havalimanı (BGG)", city: "Bingöl", code: "BGG", lng: 40.5945, lat: 38.8601, aliases: ["bingol", "bingöl airport"] },
  { label: "Şırnak Şerafettin Elçi Havalimanı (NKT)", city: "Şırnak", code: "NKT", lng: 42.0582, lat: 37.3647, aliases: ["sirnak", "şırnak", "serafettin elci"] },
  { label: "Hakkari Yüksekova Havalimanı (YKO)", city: "Hakkari", code: "YKO", lng: 44.2381, lat: 37.5497, aliases: ["hakkari airport", "yuksekova", "yüksekova"] },
  { label: "Hatay Havalimanı (HTY)", city: "Hatay", code: "HTY", lng: 36.2856, lat: 36.3608, aliases: ["hatay airport", "antakya"] },
  { label: "İzmir Selçuk Efes Havalimanı (IZM)", city: "İzmir", code: "IZM", lng: 27.329, lat: 37.9507, aliases: ["selcuk", "selçuk", "efes airport"] },
  { label: "Isparta Süleyman Demirel Havalimanı (ISE)", city: "Isparta", code: "ISE", lng: 30.3684, lat: 37.8554, aliases: ["isparta airport", "suleyman demirel", "süleyman demirel"] },
  { label: "Balıkesir Koca Seyit Havalimanı (EDO)", city: "Edremit", code: "EDO", lng: 27.0102, lat: 39.5525, aliases: ["edremit airport", "koca seyit", "balikesir", "balıkesir"] },
  { label: "Milas Bodrum Havalimanı (BJV)", city: "Bodrum", code: "BJV", lng: 27.664, lat: 37.2493, aliases: ["bodrum airport", "milas airport"] },
  { label: "Gazipaşa Alanya Havalimanı (GZP)", city: "Alanya", code: "GZP", lng: 32.297, lat: 36.2988, aliases: ["gazipasa", "gazipaşa", "alanya airport"] },
  { label: "Samsun Çarşamba Havalimanı (SZF)", city: "Samsun", code: "SZF", lng: 36.5675, lat: 41.254, aliases: ["samsun airport", "carsamba", "çarşamba"] },
  { label: "Gökçeada Havalimanı (GKD)", city: "Gökçeada", code: "GKD", lng: 25.8833, lat: 40.2045, aliases: ["gokceada", "gökçeada airport"] },
  { label: "Rize Artvin Havalimanı (RZV)", city: "Rize", code: "RZV", lng: 40.8488, lat: 41.1798, aliases: ["rize airport", "artvin airport"] },
];

const FEATURED_AIRPORTS = dedupeAirports([...POPULAR_AIRPORTS, ...TURKEY_AIRPORTS]);

function dedupeAirports(airports) {
  const seen = new Set();
  return airports.filter((airport) => {
    if (seen.has(airport.code)) return false;
    seen.add(airport.code);
    return true;
  });
}

function normalizeSearchText(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function popularAirportSuggestions(query) {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return FEATURED_AIRPORTS;

  return FEATURED_AIRPORTS
    .map((airport, index) => {
      const fields = [
        airport.code,
        airport.label,
        ...airport.aliases,
      ].map(normalizeSearchText);

      const score = fields.reduce((best, field, fieldIndex) => {
        if (field.startsWith(normalizedQuery)) return Math.min(best, fieldIndex);
        const wordStarts = field
          .split(/[\s().'-]+/)
          .some((word) => word.startsWith(normalizedQuery));
        return wordStarts ? Math.min(best, fieldIndex + 3) : best;
      }, 99);

      return { airport, score, index };
    })
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((item) => item.airport);
}

function mergeSuggestions(primary, secondary) {
  const seen = new Set();
  return [...primary, ...secondary].filter((item) => {
    const key = `${item.label}|${item.lng?.toFixed?.(4) ?? ""}|${item.lat?.toFixed?.(4) ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

const POPULAR_AIRPORT_CODES = new Set(FEATURED_AIRPORTS.map((airport) => airport.code));

function isAirportLikeResult(item) {
  const normalizedLabel = normalizeSearchText(item.label || "");
  return (
    item.kind === "airport" ||
    /\b(airport|airfield|heliport|aerodrome|air base|seaplane)\b/.test(normalizedLabel) ||
    normalizedLabel.includes("havalimani")
  );
}

function isPopularAirportResult(item) {
  const normalizedLabel = normalizeSearchText(item.label || "");
  return [...POPULAR_AIRPORT_CODES].some((code) => (
    normalizedLabel.includes(`(${code.toLocaleLowerCase("tr-TR")})`) ||
    normalizedLabel.includes(` ${code.toLocaleLowerCase("tr-TR")} `)
  ));
}

function filterPlaceSuggestions(results) {
  return results.filter((item) => !isAirportLikeResult(item) || isPopularAirportResult(item));
}

export default function LocationMapField({
  id,
  variant,
  label,
  placeholder,
  value,
  other,
  onChange,
  icon,
  showSwap,
  onSwap,
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionStyle, setSuggestionStyle] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState(value?.label ?? "");
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchRequestRef = useRef(0);
  const trimmedQuery = query.trim();
  const airportSuggestions = popularAirportSuggestions(query);
  const placeSuggestions = filterPlaceSuggestions(searchResults);
  const suggestions = trimmedQuery.length < 2
    ? airportSuggestions
    : mergeSuggestions(airportSuggestions, placeSuggestions);

  const updateSuggestionPosition = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;

    const gap = 10;
    const maxWidth = Math.min(330, window.innerWidth - 32);
    const width = maxWidth;
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);

    setSuggestionStyle({
      left,
      top: rect.bottom + gap,
      width,
      maxHeight: Math.max(180, window.innerHeight - rect.bottom - gap - 16),
    });
  };

  const showSuggestions = () => {
    window.dispatchEvent(new CustomEvent("location-field:active", { detail: id }));
    updateSuggestionPosition();
    setSuggestionsOpen(true);
  };

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  useEffect(() => {
    const handleActiveField = (event) => {
      if (event.detail !== id) {
        setSuggestionsOpen(false);
        setOpen(false);
      }
    };

    window.addEventListener("location-field:active", handleActiveField);
    return () => window.removeEventListener("location-field:active", handleActiveField);
  }, [id]);

  useEffect(() => {
    if (!open && !suggestionsOpen) return undefined;

    const handlePointer = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPopover = popoverRef.current?.contains(event.target);
      const inSuggestions = suggestionsRef.current?.contains(event.target);
      if (!inTrigger && !inPopover && !inSuggestions) {
        setOpen(false);
        setSuggestionsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, suggestionsOpen]);

  useEffect(() => {
    if (!suggestionsOpen) return undefined;

    updateSuggestionPosition();
    window.addEventListener("resize", updateSuggestionPosition);
    window.addEventListener("scroll", updateSuggestionPosition, true);

    return () => {
      window.removeEventListener("resize", updateSuggestionPosition);
      window.removeEventListener("scroll", updateSuggestionPosition, true);
    };
  }, [suggestionsOpen]);

  useEffect(() => {
    if (!suggestionsOpen || trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const requestId = ++searchRequestRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmedQuery, lang);
        if (requestId === searchRequestRef.current) {
          setSearchResults(places);
        }
      } catch {
        if (requestId === searchRequestRef.current) {
          setSearchResults([]);
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setSearching(false);
        }
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [trimmedQuery, lang, suggestionsOpen]);

  const pickSuggestion = (suggestion) => {
    const point = { label: suggestion.label, lng: suggestion.lng, lat: suggestion.lat };
    window.dispatchEvent(new CustomEvent("location-field:active", { detail: id }));
    setQuery(point.label);
    setSuggestionsOpen(false);
    setOpen(true);
    onChange(point);
  };

  const popover = open && typeof document !== "undefined"
    ? createPortal(
        <div ref={popoverRef}>
          <Suspense fallback={<div className="location-map-popover location-map-popover--portal location-map-loading">{t("map.loading")}</div>}>
            <LocationMapPopover
              variant={variant}
              value={value}
              other={other}
              query={query}
              onQueryChange={setQuery}
              onConfirm={(point) => {
                setQuery(point.label);
                onChange(point);
              }}
              onClose={() => setOpen(false)}
              className="location-map-popover--portal"
            />
          </Suspense>
        </div>,
        document.body,
      )
    : null;

  const suggestionsPopover = suggestionsOpen && !open && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={suggestionsRef}
          className="location-suggestions location-suggestions--portal"
          role="listbox"
          aria-label={trimmedQuery.length < 2 ? "Havalimanı seç" : "Konum seç"}
          style={suggestionStyle ?? undefined}
        >
          <div className="location-suggestions-title">
            {trimmedQuery.length < 2 ? "Havalimanı Seç" : "Konum Seç"}
          </div>
          {searching && suggestions.length === 0 && (
            <div className="location-suggestion-empty">Aranıyor...</div>
          )}
          {!searching && trimmedQuery.length >= 2 && suggestions.length === 0 && (
            <div className="location-suggestion-empty">Sonuç bulunamadı</div>
          )}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.code ?? `${suggestion.lng}-${suggestion.lat}-${suggestion.label}`}
              type="button"
              className="location-suggestion"
              role="option"
              onPointerDown={(event) => {
                event.preventDefault();
                pickSuggestion(suggestion);
              }}
              onClick={() => pickSuggestion(suggestion)}
            >
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={`location-field ${open || suggestionsOpen ? "open" : ""}`} ref={rootRef}>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="field-input-wrapper">
        {icon}
        <input
          id={id}
          type="text"
          className="location-field-trigger"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            showSuggestions();
            onChange(text.trim() ? { label: text } : null);
          }}
          onFocus={() => {
            if (!open) showSuggestions();
          }}
          autoComplete="off"
          aria-expanded={open || suggestionsOpen}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          className="map-btn"
          onClick={() => {
            setSuggestionsOpen(false);
            setOpen(true);
          }}
          aria-label={t("booking.showOnMap")}
          title={t("booking.showOnMap")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" />
            <path d="M9 3v16M15 5v16" />
          </svg>
        </button>
        {showSwap && (
          <button type="button" className="swap-btn" onClick={onSwap} aria-label={t("booking.swap")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swap-icon">
              <path d="M7 21V3M7 3l4 4M7 3L3 7M17 3v18M17 21l-4-4M17 21l4-4" />
            </svg>
          </button>
        )}
      </div>
      {suggestionsPopover}
      {popover}
    </div>
  );
}

export function emptyLocation() {
  return null;
}

export function locationLabel(point) {
  return point?.label ?? "";
}
