const API_URL = import.meta.env.VITE_ENQUIRY_API_URL || import.meta.env.VITE_BOOKING_API_URL || "/api";

function validateEnquiry(payload) {
  if (!payload.name?.trim() || !payload.email?.trim() || !payload.message?.trim()) {
    return true;
  }
  return false;
}

export async function submitEnquiry(payload) {
  if (validateEnquiry(payload)) {
    throw new Error("VALIDATION");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...payload, website: payload.website || "" }),
  });

  if (!response.ok) {
    throw new Error("API_ERROR");
  }

  return response.json();
}
