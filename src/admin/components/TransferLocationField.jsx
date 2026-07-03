import { useEffect, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import { searchPlaces } from "../../utils/geocode";

export default function TransferLocationField({
  value,
  placeholder,
  variant = "from",
  onChange,
  onBlur,
  onCommit,
}) {
  const [text, setText] = useState(value?.label || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    setText(value?.label || "");
  }, [value?.label]);

  useEffect(() => {
    const onDocPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hasCoords = value?.lng != null && value?.lat != null;

  const handleChange = (nextText) => {
    setText(nextText);
    const labelChanged = nextText.trim() !== (value?.label || "").trim();
    onChange({
      label: nextText,
      lng: labelChanged ? null : value?.lng ?? null,
      lat: labelChanged ? null : value?.lat ?? null,
    });
    clearTimeout(timer.current);
    if (nextText.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(nextText, "tr");
        setResults(places);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 320);
  };

  const pick = (place) => {
    setText(place.label);
    onChange({ label: place.label, lng: place.lng, lat: place.lat });
    setResults([]);
    setOpen(false);
    onCommit?.(place);
  };

  return (
    <div
      ref={rootRef}
      className={`transfer-location-field transfer-location-field--${variant}${hasCoords ? " has-coords" : ""}`}
    >
      <div className="transfer-location-input-wrap">
        <span className={`transfer-location-dot transfer-location-dot--${variant}`} aria-hidden />
        <input
          type="text"
          className="transfer-input transfer-input--location"
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => onBlur?.()}
        />
      </div>
      {open && (results.length > 0 || loading) && (
        <ul className="transfer-location-results">
          {loading && results.length === 0 && <li className="transfer-location-empty">Aranıyor…</li>}
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button type="button" className="transfer-location-option" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(r)}>
                {r.kind === "airport" ? <Plane size={12} /> : <MapPin size={12} />}
                <span>{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
