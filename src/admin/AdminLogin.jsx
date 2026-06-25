import { useState } from "react";
import { adminLogin, agencyLogin } from "../api/admin";

export default function AdminLogin({ onSuccess }) {
  const [mode, setMode] = useState("admin");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "admin") {
        await adminLogin(password);
      } else {
        await agencyLogin(username, password);
      }
      onSuccess?.();
    } catch {
      setError(mode === "admin" ? "Geçersiz şifre" : "Geçersiz kullanıcı adı veya şifre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>VIP Transfer</h1>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" className={`admin-btn ${mode === "admin" ? "admin-btn--gold" : "admin-btn--ghost"}`} onClick={() => setMode("admin")} style={{ flex: 1 }}>
            Admin
          </button>
          <button type="button" className={`admin-btn ${mode === "agency" ? "admin-btn--gold" : "admin-btn--ghost"}`} onClick={() => setMode("agency")} style={{ flex: 1 }}>
            Acente
          </button>
        </div>
        {mode === "agency" && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adı"
            autoComplete="username"
          />
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "admin" ? "Admin şifresi" : "Şifre"}
          autoComplete="current-password"
        />
        {error && <div className="admin-error">{error}</div>}
        <button type="submit" className="admin-btn admin-btn--gold" disabled={loading}>
          {loading ? "Giriş..." : "Giriş Yap"}
        </button>
        <a href="/" className="admin-login-back">← Siteye dön</a>
      </form>
    </div>
  );
}
