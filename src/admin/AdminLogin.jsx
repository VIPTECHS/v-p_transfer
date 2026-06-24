import { useState } from "react";
import { adminLogin } from "../api/admin";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(password);
      onSuccess?.();
    } catch {
      setError("Geçersiz şifre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>VIP Transfer Admin</h1>
        <p>Yönetim paneline erişmek için şifrenizi girin.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin şifresi"
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
