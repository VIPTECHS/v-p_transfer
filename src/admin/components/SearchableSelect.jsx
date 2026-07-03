import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({ options, value, onChange, placeholder, displayKey = "name", valueKey = "id" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o[valueKey] === value);
  const filtered = search
    ? options.filter((o) => (o[displayKey] || "").toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: "#f9fafb",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          color: selected ? "#1a1a2e" : "#9ca3af",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{selected ? selected[displayKey] : placeholder || "Seçin"}</span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          marginTop: 4,
          zIndex: 50,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxHeight: 200,
          overflow: "auto",
        }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara..."
            autoFocus
            style={{
              width: "100%",
              border: "none",
              borderBottom: "1px solid #e5e7eb",
              padding: "8px 12px",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            onClick={() => { onChange(null); setOpen(false); setSearch(""); }}
            style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#9ca3af" }}
          >
            — Seçimi kaldır —
          </div>
          {filtered.map((o) => (
            <div
              key={o[valueKey]}
              onClick={() => { onChange(o[valueKey]); setOpen(false); setSearch(""); }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 13,
                background: o[valueKey] === value ? "#eff6ff" : "transparent",
                color: "#1a1a2e",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = o[valueKey] === value ? "#eff6ff" : "transparent"; }}
            >
              {o[displayKey]}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "8px 12px", color: "#9ca3af", fontSize: 13 }}>Sonuç bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
}
