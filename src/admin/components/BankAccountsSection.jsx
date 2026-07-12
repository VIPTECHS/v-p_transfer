import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function BankAccountsSection({
  accounts,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    accountHolder: "", bankName: "", branch: "", iban: "", swift: "", currency: "EUR", paymentTermDays: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreate(form);
      setForm({ accountHolder: "", bankName: "", branch: "", iban: "", swift: "", currency: "EUR", paymentTermDays: "" });
      setShowForm(false);
    } catch {
      alert("Banka hesabı eklenemedi");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3>Banka Hesapları</h3>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Hesap Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-grid admin-card" style={{ marginBottom: 16 }}>
          <div className="detail-field"><label>Hesap Sahibi *</label><input value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} required /></div>
          <div className="detail-field"><label>Banka *</label><input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} required /></div>
          <div className="detail-field"><label>Şube</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
          <div className="detail-field"><label>IBAN *</label><input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} required /></div>
          <div className="detail-field"><label>SWIFT</label><input value={form.swift} onChange={(e) => setForm({ ...form, swift: e.target.value })} /></div>
          <div className="detail-field"><label>Para Birimi</label><input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          <div className="detail-field"><label>Ödeme Vadesi (gün)</label><input type="number" value={form.paymentTermDays} onChange={(e) => setForm({ ...form, paymentTermDays: e.target.value })} /></div>
          <div className="admin-form-actions"><button type="submit" className="admin-btn admin-btn--primary">Kaydet</button></div>
        </form>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Hesap Sahibi</th><th>Banka</th><th>IBAN</th><th>Para Birimi</th><th>Vade</th><th></th></tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td>{a.accountHolder}</td>
                <td>{a.bankName}{a.branch ? ` / ${a.branch}` : ""}</td>
                <td>{a.iban}</td>
                <td>{a.currency}</td>
                <td>{a.paymentTermDays ? `${a.paymentTermDays} gün` : "—"}</td>
                <td>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onDelete(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && <tr><td colSpan={6} className="admin-empty">Banka hesabı yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
