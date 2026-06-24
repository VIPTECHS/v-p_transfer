const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";
const ADMIN_KEY = "vip_admin_password";

function adminHeaders() {
  const password = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(ADMIN_KEY) : null;
  return password ? { "X-Admin-Password": password } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...adminHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    clearAdminPassword();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vip-admin-unauthorized"));
    }
    const error = new Error("UNAUTHORIZED");
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("API_ERROR");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export function setAdminPassword(password) {
  sessionStorage.setItem(ADMIN_KEY, password);
}

export function clearAdminPassword() {
  sessionStorage.removeItem(ADMIN_KEY);
}

export function hasAdminPassword() {
  return typeof sessionStorage !== "undefined" && Boolean(sessionStorage.getItem(ADMIN_KEY));
}

export async function adminLogin(password) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error("INVALID_PASSWORD");
  setAdminPassword(password);
  return { success: true };
}

export function fetchStats() {
  return request("/stats");
}

export function fetchBookings(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);
  const qs = query.toString();
  return request(`/bookings${qs ? `?${qs}` : ""}`);
}

export function fetchBooking(id) {
  return request(`/bookings/${id}`);
}

export function updateBooking(id, data) {
  return request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteBooking(id) {
  return request(`/bookings/${id}`, { method: "DELETE" });
}

export function fetchEnquiries(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  const qs = query.toString();
  return request(`/enquiries${qs ? `?${qs}` : ""}`);
}

export function updateEnquiry(id, data) {
  return request(`/enquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function fetchOperations(date) {
  const query = date ? `?date=${date}` : "";
  return request(`/operations${query}`);
}

export function fetchDrivers() {
  return request("/drivers");
}

export function createDriver(data) {
  return request("/drivers", { method: "POST", body: JSON.stringify(data) });
}

export function updateDriver(id, data) {
  return request(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function fetchVehicles() {
  return request("/vehicles");
}

export function createVehicle(data) {
  return request("/vehicles", { method: "POST", body: JSON.stringify(data) });
}

export function updateVehicle(id, data) {
  return request(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
