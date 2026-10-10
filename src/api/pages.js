const API_URL = (import.meta.env.VITE_BOOKING_API_URL || "/api").replace(/\/$/, "");
const ADMIN_TOKEN_KEY = "vip_admin_token";

function authHeaders() {
  const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function json(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders(), ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = new Error("API_ERROR");
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = null;
    }
    throw err;
  }
  return res.json();
}

// ---- Public ----
export function fetchPublicPage(slug) {
  return json(`/pages/public/${encodeURIComponent(slug)}`);
}

// ---- Admin ----
export function listPages() {
  return json("/pages");
}
export function getPage(id) {
  return json(`/pages/${id}`);
}
export function createPage(data) {
  return json("/pages", { method: "POST", body: JSON.stringify(data) });
}
export function updatePage(id, data) {
  return json(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export function deletePage(id) {
  return json(`/pages/${id}`, { method: "DELETE" });
}

export function listPolicyContent() {
  return json("/policy-content");
}

export function savePolicyContent(slug, language, data) {
  return json(`/policy-content/${encodeURIComponent(slug)}/${encodeURIComponent(language)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function fetchPublicPolicyContent(slug, language) {
  return json(`/policy-content/public/${encodeURIComponent(slug)}/${encodeURIComponent(language)}`);
}
