const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";

function validateBooking(payload) {
  if (!payload.pickupAt) return "pickupAt";
  if (!payload.from?.trim()) return "from";
  if (payload.type === "hourly") {
    if (!payload.durationHours || payload.durationHours < 1) return "durationHours";
  } else if (!payload.to?.trim()) {
    return "to";
  }
  return null;
}

export function isPointToPointType(type) {
  return type !== "hourly";
}

export async function submitBooking(payload) {
  const invalid = validateBooking(payload);
  if (invalid) {
    throw new Error("VALIDATION");
  }

  let response;
  try {
    response = await fetch(`${API_URL.replace(/\/$/, "")}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, website: "" }),
    });
  } catch {
    const error = new Error("API_UNAVAILABLE");
    error.code = "API_UNAVAILABLE";
    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || "API_ERROR");
    error.code = body.error || "API_ERROR";
    error.status = response.status;
    throw error;
  }

  return response.json();
}
