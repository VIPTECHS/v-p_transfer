export const BOOKING_TYPES = ["transfer", "chauffeur", "hourly", "group", "events"];

export function requiresDestination(type) {
  return type !== "hourly";
}

export function requiresDuration(type) {
  return type === "hourly";
}
