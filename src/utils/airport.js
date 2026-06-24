const AIRPORT_KEYWORDS = [
  "airport", "havaliman", "havalimanı", "istanbul airport", "sabiha",
  " (ist)", " (saw)", " (ayt)", " (esb)", " (lhr)", " (jfk)",
];

export function isAirportRelated(text) {
  const t = (text || "").toLowerCase();
  return AIRPORT_KEYWORDS.some((k) => t.includes(k));
}

export function tripInvolvesAirport(from, to) {
  return isAirportRelated(from) || isAirportRelated(to);
}
