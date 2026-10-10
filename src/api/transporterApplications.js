const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";

export async function submitTransporterApplication(payload) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/transporter-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...payload, fax: payload.fax || "" }),
  });

  if (!response.ok) {
    const error = new Error("TRANSPORTER_APPLICATION_ERROR");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
