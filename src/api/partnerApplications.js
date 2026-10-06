const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";

export async function submitPartnerApplication(payload) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/partner-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...payload, fax: payload.fax || "" }),
  });

  if (!response.ok) {
    const error = new Error("PARTNER_APPLICATION_ERROR");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
