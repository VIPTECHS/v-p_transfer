const CURRENCIES = ["EUR", "USD", "TRY", "GBP"];

export default function CurrencyInput({ value, currency, onValueChange, onCurrencyChange }) {
  return (
    <div className="currency-input">
      <input
        type="number"
        step="0.01"
        min="0"
        value={value ?? ""}
        onChange={(e) => onValueChange(e.target.value ? parseFloat(e.target.value) : null)}
        placeholder="0,00"
      />
      <select value={currency || "EUR"} onChange={(e) => onCurrencyChange(e.target.value)}>
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
