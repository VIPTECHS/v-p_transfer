import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CalendarWithTime from "./CalendarWithTime";
import { useI18n } from "../i18n/I18nContext";
import {
  defaultPickupDate,
  formatPickupDateDisplay,
  formatPickupDisplay,
  formatPickupTimeDisplay,
  fromPickupISO,
  hoursBetween,
  toPickupISO,
} from "../utils/datetime";

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="field-icon calendar-icon" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="field-icon clock-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function PickupDateTimeField({
  value,
  onChange,
  showEndTime = false,
  onDurationChange,
  mode = "datetime",
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [draftDuration, setDraftDuration] = useState(null);
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const selectedDate = fromPickupISO(value);
  const draftDate = fromPickupISO(draft);
  const isDate = mode === "date";
  const isTime = mode === "time";
  const calendarMode = isDate ? "date" : isTime ? "time" : "full";
  const label = isDate
    ? t("booking.dateLabel")
    : isTime
      ? t("booking.timeLabel")
      : t("booking.pickupLabel");
  const display = isDate
    ? formatPickupDateDisplay(selectedDate, lang)
    : isTime
      ? formatPickupTimeDisplay(selectedDate)
      : formatPickupDisplay(selectedDate, lang);
  const triggerId = isDate ? "pickup-date-trigger" : isTime ? "pickup-time-trigger" : "pickup-datetime-trigger";

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDraftDuration(null);
    }
  }, [open, value]);

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

  const popover = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="pickup-datetime-popover pickup-datetime-popover--portal"
          role="dialog"
          aria-label={label}
          ref={popoverRef}
        >
          <CalendarWithTime
            value={draftDate}
            showEndTime={showEndTime && !isDate && !isTime}
            mode={calendarMode}
            onChange={handleCalendarChange}
          />
          <div className="pickup-datetime-footer">
            <span className="pickup-datetime-preview">
              {isDate
                ? formatPickupDateDisplay(draftDate, lang)
                : isTime
                  ? formatPickupTimeDisplay(draftDate)
                  : formatPickupDisplay(draftDate, lang)}
            </span>
            <button type="button" className="pickup-datetime-confirm" onClick={handleConfirm}>
              {t("calendar.confirm")}
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={`pickup-datetime ${open ? "open" : ""}`} ref={rootRef}>
      <label htmlFor={triggerId} className="field-label">{label}</label>
      <button
        id={triggerId}
        type="button"
        className="pickup-datetime-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {isTime ? <ClockIcon /> : <CalendarIcon />}
        <span>{display}</span>
      </button>
      {popover}
    </div>
  );
}

export function createDefaultPickupISO() {
  return toPickupISO(defaultPickupDate());
}
