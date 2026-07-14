import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n/I18nContext";

const LocationMapPopover = lazy(() => import("./LocationMapPopover"));

/** @typedef {{ label: string, lng: number, lat: number }} LocationPoint */

export default function LocationMapField({
  id,
  variant,
  label,
  placeholder,
  value,
  other,
  onChange,
  icon,
  showSwap,
  onSwap,
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value?.label ?? "");
  const rootRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      const inTrigger = rootRef.current?.contains(event.target);
      const inPopover = popoverRef.current?.contains(event.target);
      if (!inTrigger && !inPopover) setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const popover = open && typeof document !== "undefined"
    ? createPortal(
        <div ref={popoverRef}>
          <Suspense fallback={<div className="location-map-popover location-map-popover--portal location-map-loading">{t("map.loading")}</div>}>
            <LocationMapPopover
              variant={variant}
              value={value}
              other={other}
              query={query}
              onQueryChange={setQuery}
              onConfirm={(point) => {
                setQuery(point.label);
                onChange(point);
              }}
              onClose={() => setOpen(false)}
              className="location-map-popover--portal"
            />
          </Suspense>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={`location-field ${open ? "open" : ""}`} ref={rootRef}>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="field-input-wrapper">
        {icon}
        <input
          id={id}
          type="text"
          className="location-field-trigger"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            onChange(text.trim() ? { label: text } : null);
          }}
          autoComplete="off"
          aria-expanded={open}
          aria-haspopup="dialog"
        />
        <button
          type="button"
          className="map-btn"
          onClick={() => setOpen(true)}
          aria-label={t("booking.showOnMap")}
          title={t("booking.showOnMap")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" />
            <path d="M9 3v16M15 5v16" />
          </svg>
        </button>
        {showSwap && (
          <button type="button" className="swap-btn" onClick={onSwap} aria-label={t("booking.swap")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swap-icon">
              <path d="M7 21V3M7 3l4 4M7 3L3 7M17 3v18M17 21l-4-4M17 21l4-4" />
            </svg>
          </button>
        )}
      </div>
      {popover}
    </div>
  );
}

export function emptyLocation() {
  return null;
}

export function locationLabel(point) {
  return point?.label ?? "";
}
