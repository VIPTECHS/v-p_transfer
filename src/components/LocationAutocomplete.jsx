import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { searchPlaces } from "../utils/geocode";

export default function LocationAutocomplete({ label, placeholder, point, onChange }) {
  const { lang } = useI18n();
  const [text, setText] = useState(point?.label || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (value) => {
    setText(value);
    onChange({ label: value });
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await searchPlaces(value, lang);
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const pick = (r) => {
    setText(r.label);
    onChange({ label: r.label, lng: r.lng, lat: r.lat });
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="vehicle-book-field vehicle-ac" ref={rootRef}>
      <span>{label}</span>
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (results.length > 0 || loading) && (
        <ul className="vehicle-ac-list">
          {loading && results.length === 0 && <li className="vehicle-ac-empty">…</li>}
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button type="button" className="vehicle-ac-option" onClick={() => pick(r)}>
                {r.kind === "airport" ? "✈️ " : "📍 "}{r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
