const API_URL = import.meta.env.VITE_BOOKING_API_URL || "/api";
const ADMIN_TOKEN_KEY = "vip_admin_token";
const AGENCY_TOKEN_KEY = "vip_agency_token";
const AGENCY_INFO_KEY = "vip_agency_info";

function adminHeaders() {
  const adminToken = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  if (adminToken) return { Authorization: `Bearer ${adminToken}` };
  const agencyToken = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(AGENCY_TOKEN_KEY) : null;
  if (agencyToken) return { Authorization: `Bearer ${agencyToken}` };
  return {};
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
    clearAdminSession();
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

export function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(AGENCY_TOKEN_KEY);
  sessionStorage.removeItem(AGENCY_INFO_KEY);
}

/** @deprecated use clearAdminSession */
export function clearAdminPassword() {
  clearAdminSession();
}

export function hasAdminSession() {
  if (typeof sessionStorage === "undefined") return false;
  return Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY)) || Boolean(sessionStorage.getItem(AGENCY_TOKEN_KEY));
}

/** @deprecated use hasAdminSession */
export function hasAdminPassword() {
  return hasAdminSession();
}

export function getSessionRole() {
  if (typeof sessionStorage === "undefined") return null;
  if (sessionStorage.getItem(ADMIN_TOKEN_KEY)) return "admin";
  if (sessionStorage.getItem(AGENCY_TOKEN_KEY)) return "agency";
  return null;
}

export function getAgencyInfo() {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(AGENCY_INFO_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function adminLogin(password) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error("INVALID_PASSWORD");
  const data = await response.json();
  if (!data.token) throw new Error("INVALID_PASSWORD");
  setAdminToken(data.token);
  return data;
}

export async function agencyLogin(username, password) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/agency-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("INVALID_CREDENTIALS");
  const data = await response.json();
  sessionStorage.setItem(AGENCY_TOKEN_KEY, data.token);
  sessionStorage.setItem(AGENCY_INFO_KEY, JSON.stringify({ agencyId: data.agencyId, agencyName: data.agencyName }));
  return data;
}

// --- Country/City/Agency API ---
export function fetchCountries() { return request("/countries"); }
export function createCountry(data) { return request("/countries", { method: "POST", body: JSON.stringify(data) }); }
export function updateCountry(id, data) { return request(`/countries/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteCountry(id) { return request(`/countries/${id}`, { method: "DELETE" }); }

export function fetchCities(params = {}) {
  const query = new URLSearchParams();
  if (params.countryId) query.set("countryId", params.countryId);
  if (params.active) query.set("active", "true");
  const qs = query.toString();
  return request(`/cities${qs ? `?${qs}` : ""}`);
}
export function createCity(data) { return request("/cities", { method: "POST", body: JSON.stringify(data) }); }
export function updateCity(id, data) { return request(`/cities/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteCity(id) { return request(`/cities/${id}`, { method: "DELETE" }); }

export function fetchAgencies(params = {}) {
  const query = new URLSearchParams();
  if (params.cityId) query.set("cityId", params.cityId);
  const qs = query.toString();
  return request(`/agencies${qs ? `?${qs}` : ""}`);
}
export function createAgency(data) { return request("/agencies", { method: "POST", body: JSON.stringify(data) }); }
export function updateAgency(id, data) { return request(`/agencies/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function resetAgencyPassword(id, password) { return request(`/agencies/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) }); }

// --- Agency Panel API ---
export function fetchAgencyProfile() { return request("/agency/profile"); }
export function updateAgencyProfile(data) { return request("/agency/profile", { method: "PATCH", body: JSON.stringify(data) }); }
export function fetchAgencyBookings(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const qs = query.toString();
  return request(`/agency/bookings${qs ? `?${qs}` : ""}`);
}
export function fetchAgencyBooking(id) { return request(`/agency/bookings/${id}`); }
export function acceptAgencyBooking(id) { return request(`/agency/bookings/${id}/accept`, { method: "POST" }); }
export function declineAgencyBooking(id, note) {
  return request(`/agency/bookings/${id}/decline`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}
export function fetchAgencyStats() { return request("/agency/stats"); }

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

export function routeBookingToAgency(bookingId, agencyId) {
  return request(`/bookings/${bookingId}/route-agency`, {
    method: "POST",
    body: JSON.stringify({ agencyId }),
  });
}

export function clearAgencyRoute(bookingId) {
  return request(`/bookings/${bookingId}/clear-agency-route`, { method: "POST" });
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

// --- Reservation API ---
export function fetchReservations(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);
  const qs = query.toString();
  return request(`/reservations${qs ? `?${qs}` : ""}`);
}
export function fetchReservation(id) { return request(`/reservations/${id}`); }
export function createReservation(data) { return request("/reservations", { method: "POST", body: JSON.stringify(data) }); }
export function updateReservation(id, data) { return request(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteReservation(id) { return request(`/reservations/${id}`, { method: "DELETE" }); }

// --- Transfer sub-resource ---
export function addTransfer(reservationId, data) { return request(`/reservations/${reservationId}/transfers`, { method: "POST", body: JSON.stringify(data) }); }
export function updateTransfer(reservationId, transferId, data) { return request(`/reservations/${reservationId}/transfers/${transferId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteTransfer(reservationId, transferId) { return request(`/reservations/${reservationId}/transfers/${transferId}`, { method: "DELETE" }); }

// --- Passenger sub-resource ---
export function addPassenger(reservationId, data) { return request(`/reservations/${reservationId}/passengers`, { method: "POST", body: JSON.stringify(data) }); }
export function updatePassenger(reservationId, passengerId, data) { return request(`/reservations/${reservationId}/passengers/${passengerId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deletePassenger(reservationId, passengerId) { return request(`/reservations/${reservationId}/passengers/${passengerId}`, { method: "DELETE" }); }

// --- Customer API ---
export function fetchCustomers(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  const qs = query.toString();
  return request(`/customers${qs ? `?${qs}` : ""}`);
}
export function fetchCustomer(id) { return request(`/customers/${id}`); }
export function createCustomer(data) { return request("/customers", { method: "POST", body: JSON.stringify(data) }); }
export function updateCustomer(id, data) { return request(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }

// --- Supplier API ---
export function fetchSuppliers(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.cityId) query.set("cityId", params.cityId);
  const qs = query.toString();
  return request(`/suppliers${qs ? `?${qs}` : ""}`);
}
export function fetchSupplier(id) { return request(`/suppliers/${id}`); }
export function createSupplier(data) { return request("/suppliers", { method: "POST", body: JSON.stringify(data) }); }
export function updateSupplier(id, data) { return request(`/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }

// --- Payments API ---
export function fetchPayments(params = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  const qs = query.toString();
  return request(`/payments${qs ? `?${qs}` : ""}`);
}
export function fetchPaymentSummary() { return request("/payments/summary"); }

// --- Flight tracking API ---
export function fetchFlightStatus(code, date) {
  const query = new URLSearchParams();
  if (date) query.set("date", date);
  const qs = query.toString();
  return request(`/flights/${encodeURIComponent(code)}${qs ? `?${qs}` : ""}`);
}

// --- Reports API ---
export function fetchRevenueReport() { return request("/reports/revenue"); }
export function fetchSuppliersReport() { return request("/reports/suppliers"); }
