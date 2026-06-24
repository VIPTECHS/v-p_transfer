import { useEffect, useRef, useState } from "react";
import CalendarWithTime from "./CalendarWithTime";
import { useI18n } from "../i18n/I18nContext";
import {
  defaultPickupDate,
  formatPickupDisplay,
  fromPickupISO,
  hoursBetween,
  toPickupISO,
} from "../utils/datetime";

export default function PickupDateTimeField({
  value,
  onChange,
  showEndTime = false,
  onDurationChange,
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [draftDuration, setDraftDuration] = useState(null);
  const rootRef = useRef(null);
  const selectedDate = fromPickupISO(value);
  const draftDate = fromPickupISO(draft);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDraftDuration(null);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
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

  const handleCalendarChange = ({ pickupAt, startTime, endTime }) => {
    setDraft(toPickupISO(pickupAt));
    if (showEndTime) {
      setDraftDuration(String(hoursBetween(startTime, endTime)));
    }
  };

  const handleConfirm = () => {
    onChange(draft);
    if (showEndTime && onDurationChange && draftDuration) {
      onDurationChange(draftDuration);
    }
    setOpen(false);
  };

  return (
    <div className={`pickup-datetime ${open ? "open" : ""}`} ref={rootRef}>
      <label htmlFor="pickup-date-trigger" className="field-label">{t("booking.pickupLabel")}</label>
      <button
        id="pickup-date-trigger"
        type="button"
        className="pickup-datetime-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="field-icon calendar-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{formatPickupDisplay(selectedDate, lang)}</span>
      </button>

      {open && (
        <div className="pickup-datetime-popover" role="dialog" aria-label={t("booking.pickupLabel")}>
          <CalendarWithTime
            value={draftDate}
            showEndTime={showEndTime}
            onChange={handleCalendarChange}
          />
          <div className="pickup-datetime-footer">
            <span className="pickup-datetime-preview">
              {formatPickupDisplay(draftDate, lang)}
            </span>
            <button type="button" className="pickup-datetime-confirm" onClick={handleConfirm}>
              {t("calendar.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function createDefaultPickupISO() {
  return toPickupISO(defaultPickupDate());
}
