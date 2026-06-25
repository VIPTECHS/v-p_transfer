import { useEffect, useState } from "react";
import { fetchAgencyProfile, updateAgencyProfile } from "../api/admin";

export default function AgencyProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAgencyProfile().then((p) => {
      setProfile(p);
      setForm({ name: p.name || "", phone: p.phone || "", email: p.email || "", contactName: p.contactName || "", address: p.address || "" });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = await updateAgencyProfile(form);
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <p>Yükleniyor...</p>;

  return (
    <>
      <h1 className="admin-page-title">Profil</h1>
      <div className="admin-card" style={{ maxWidth: 600 }}>
        <p style={{ marginBottom: 16, color: "rgba(255,255,255,.5)" }}>
          {profile.city?.name}, {profile.city?.country?.name} — Kullanıcı: <strong>{profile.username}</strong>
        </p>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>Acente Adı <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Telefon <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>E-posta <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>İletişim Kişisi <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></label>
          <label>Adres <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} /></label>
          <button type="submit" className="admin-btn admin-btn--gold">Kaydet</button>
          {saved && <span style={{ color: "#4caf50" }}>Kaydedildi!</span>}
        </form>
      </div>
    </>
  );
}
