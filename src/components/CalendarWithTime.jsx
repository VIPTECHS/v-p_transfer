import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { resolveIntlLocale } from "../i18n/locale";
import {
  combineDateAndTime,
  dateToTimeValue,
  getMonthMatrix,
  isBeforeDay,
  isSameDay,
  startOfDay,
} from "../utils/datetime";

function ChevronIcon({ direction = "left" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={direction === "right" ? { transform: "rotate(180deg)" } : undefined}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const CLOCK_R = 100;
const DOT_R = 16;

function polarToXY(value, total, radius) {
  const angle = (value / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CLOCK_R + radius * Math.cos(angle),
    y: CLOCK_R + radius * Math.sin(angle),
  };
}

function ClockFace({ mode, selected, onSelect, onDone }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const items = mode === "hour" ? HOURS : MINUTES;
  const total = mode === "hour" ? 24 : 60;

  const outerR = CLOCK_R - 18;
  const innerR = CLOCK_R - 46;

  const getValueFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left - CLOCK_R;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top - CLOCK_R;
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    if (mode === "hour") {
      const dist = Math.sqrt(x * x + y * y);
      const isInner = dist < (outerR + innerR) / 2;
      const step = Math.round((angle / (2 * Math.PI)) * 12) % 12;
      return isInner ? step + 12 : step === 0 ? 0 : step;
    }
    const step = Math.round((angle / (2 * Math.PI)) * 12) % 12;
    return step * 5;
  }, [mode, outerR, innerR]);

  const handlePointerDown = (e) => {
    dragging.current = true;
    const val = getValueFromEvent(e);
    if (val !== null) onSelect(val);
  };

  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    const val = getValueFromEvent(e);
    if (val !== null) onSelect(val);
  };

  const handlePointerUp = () => {
    if (dragging.current) {
      dragging.current = false;
      onDone();
    }
  };

  useEffect(() => {
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const selectedPos = mode === "hour"
    ? polarToXY(selected >= 12 ? selected - 12 : selected, 12, selected >= 12 ? innerR : outerR)
    : polarToXY(selected / 5, 12, outerR);

  const renderNumbers = () => {
    if (mode === "hour") {
      return (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
            const pos = polarToXY(h, 12, outerR);
            const active = selected === h;
            return (
              <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                className={`clock-number ${active ? "clock-number--active" : ""}`}
                style={{ fontSize: 14 }}>
                {h === 0 ? "00" : h}
              </text>
            );
          })}
          {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => {
            const pos = polarToXY(h - 12, 12, innerR);
            const active = selected === h;
            return (
              <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                className={`clock-number clock-number--inner ${active ? "clock-number--active" : ""}`}
                style={{ fontSize: 12 }}>
                {h}
              </text>
            );
          })}
        </>
      );
    }

    return MINUTES.map((m) => {
      const pos = polarToXY(m / 5, 12, outerR);
      const active = selected === m;
      return (
        <text key={m} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
          className={`clock-number ${active ? "clock-number--active" : ""}`}
          style={{ fontSize: 14 }}>
          {String(m).padStart(2, "0")}
        </text>
      );
    });
  };

  return (
    <svg
      ref={svgRef}
      className="clock-face"
      viewBox={`0 0 ${CLOCK_R * 2} ${CLOCK_R * 2}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: "none" }}
    >
      <circle cx={CLOCK_R} cy={CLOCK_R} r={CLOCK_R} className="clock-bg" />
      <line x1={CLOCK_R} y1={CLOCK_R} x2={selectedPos.x} y2={selectedPos.y} className="clock-hand" />
      <circle cx={CLOCK_R} cy={CLOCK_R} r={3} className="clock-center-dot" />
      <circle cx={selectedPos.x} cy={selectedPos.y} r={DOT_R} className="clock-selected-dot" />
      {renderNumbers()}
    </svg>
  );
}

function TimePicker({ value, onChange }) {
  const [h, m] = value.split(":").map(Number);
  const [mode, setMode] = useState("hour");

  const handleHourSelect = (hour) => {
    onChange(`${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  const handleMinuteSelect = (minute) => {
    onChange(`${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  };

  const handleDone = () => {
    if (mode === "hour") setMode("minute");
  };

  return (
    <div className="clock-picker">
      <div className="clock-picker-display">
        <button type="button" className={`clock-digit ${mode === "hour" ? "clock-digit--active" : ""}`} onClick={() => setMode("hour")}>
          {String(h).padStart(2, "0")}
        </button>
        <span className="clock-colon">:</span>
        <button type="button" className={`clock-digit ${mode === "minute" ? "clock-digit--active" : ""}`} onClick={() => setMode("minute")}>
          {String(m).padStart(2, "0")}
        </button>
      </div>
      <ClockFace
        mode={mode}
        selected={mode === "hour" ? h : m}
        onSelect={mode === "hour" ? handleHourSelect : handleMinuteSelect}
        onDone={handleDone}
      />
    </div>
  );
}

const MONTH_NAMES_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTH_BY_LANG = { tr: MONTH_NAMES_TR, en: MONTH_NAMES_EN, de: MONTH_NAMES_DE };

function MonthPicker({ viewDate, onSelect, lang }) {
  const year = viewDate.getFullYear();
  const months = MONTH_BY_LANG[lang] || MONTH_NAMES_EN;
  const current = viewDate.getMonth();

  return (
    <div className="month-year-grid">
      {months.map((label, i) => (
        <button
          key={i}
          type="button"
          className={`month-year-cell ${i === current ? "month-year-cell--selected" : ""}`}
          onClick={() => onSelect(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function YearPicker({ viewDate, onSelect }) {
  const currentYear = viewDate.getFullYear();
  const startYear = currentYear - 5;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="month-year-grid">
      {years.map((y) => (
        <button
          key={y}
          type="button"
          className={`month-year-cell ${y === currentYear ? "month-year-cell--selected" : ""}`}
          onClick={() => onSelect(y)}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

export default function CalendarWithTime({
  value,
  onChange,
  showEndTime = false,
  minDate = startOfDay(new Date()),
}) {
  const { t, lang } = useI18n();
  const [viewDate, setViewDate] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const [startTime, setStartTime] = useState(() => dateToTimeValue(value));
  const [endTime, setEndTime] = useState("12:30");
  const [drillView, setDrillView] = useState("days");
  const [clockTarget, setClockTarget] = useState(null);

  useEffect(() => {
    setStartTime(dateToTimeValue(value));
  }, [value]);

  const locale = resolveIntlLocale(lang);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long" }).format(viewDate);
  const yearLabel = viewDate.getFullYear();
  const weekdays = t("calendar.weekdays").split(",");
  const cells = useMemo(() => getMonthMatrix(viewDate), [viewDate]);

  const emitChange = (date, nextStart = startTime, nextEnd = endTime) => {
    onChange({
      pickupAt: combineDateAndTime(date, nextStart),
      startTime: nextStart,
      endTime: nextEnd,
    });
  };

  const selectDate = (date) => {
    if (!date || isBeforeDay(date, minDate)) return;
    emitChange(date);
  };

  const shiftMonth = (delta) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const handleHeaderClick = () => {
    if (drillView === "days") setDrillView("months");
    else if (drillView === "months") setDrillView("years");
    else setDrillView("days");
  };

  const handleMonthSelect = (monthIndex) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setDrillView("days");
  };

  const handleYearSelect = (year) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setDrillView("months");
  };

  const shiftView = (delta) => {
    if (drillView === "days") {
      shiftMonth(delta);
    } else if (drillView === "months") {
      setViewDate(new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() + delta * 12, viewDate.getMonth(), 1));
    }
  };

  const headerLabel = drillView === "days"
    ? `${monthLabel} ${yearLabel}`
    : drillView === "months"
      ? String(yearLabel)
      : `${viewDate.getFullYear() - 5} – ${viewDate.getFullYear() + 6}`;

  const handleTimeClick = (target) => {
    setClockTarget(clockTarget === target ? null : target);
  };

  const handleClockChange = (timeStr) => {
    if (clockTarget === "start") {
      setStartTime(timeStr);
      emitChange(value, timeStr, endTime);
    } else if (clockTarget === "end") {
      setEndTime(timeStr);
      emitChange(value, startTime, timeStr);
    }
  };

  return (
    <div className="calendar-card">
      {clockTarget ? (
        <div className="calendar-card-body">
          <div className="calendar-header">
            <button type="button" className="calendar-nav" onClick={() => setClockTarget(null)}>
              <ChevronIcon />
            </button>
            <strong>{clockTarget === "start" ? t("calendar.startTime") : t("calendar.endTime")}</strong>
            <span style={{ width: 38 }} />
          </div>
          <TimePicker
            value={clockTarget === "start" ? startTime : endTime}
            onChange={handleClockChange}
          />
        </div>
      ) : (
        <>
          <div className="calendar-card-body">
            <div className="calendar-header">
              <button type="button" className="calendar-nav" onClick={() => shiftView(-1)} aria-label={t("calendar.prevMonth")}>
                <ChevronIcon />
              </button>
              <button type="button" className="calendar-header-label" onClick={handleHeaderClick}>
                {headerLabel}
              </button>
              <button type="button" className="calendar-nav" onClick={() => shiftView(1)} aria-label={t("calendar.nextMonth")}>
                <ChevronIcon direction="right" />
              </button>
            </div>

            {drillView === "days" && (
              <>
                <div className="calendar-weekdays">
                  {weekdays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="calendar-grid" role="grid" aria-label={t("calendar.pickDate")}>
                  {cells.map((date, index) => {
                    if (!date) {
                      return <span key={`empty-${index}`} className="calendar-day calendar-day--empty" />;
                    }
                    const disabled = isBeforeDay(date, minDate);
                    const selected = isSameDay(date, value);
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        className={`calendar-day ${selected ? "calendar-day--selected" : ""} ${disabled ? "calendar-day--disabled" : ""}`}
                        disabled={disabled}
                        onClick={() => selectDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {drillView === "months" && (
              <MonthPicker viewDate={viewDate} onSelect={handleMonthSelect} lang={lang} />
            )}

            {drillView === "years" && (
              <YearPicker viewDate={viewDate} onSelect={handleYearSelect} />
            )}
          </div>

          <div className="calendar-card-footer">
            <div className="calendar-time-fields">
              <div className="calendar-time-field">
                <span>{t("calendar.startTime")}</span>
                <button type="button" className="calendar-time-input" onClick={() => handleTimeClick("start")}>
                  <span className="calendar-time-value">{startTime}</span>
                  <ClockIcon />
                </button>
              </div>

              {showEndTime && (
                <div className="calendar-time-field">
                  <span>{t("calendar.endTime")}</span>
                  <button type="button" className="calendar-time-input" onClick={() => handleTimeClick("end")}>
                    <span className="calendar-time-value">{endTime}</span>
                    <ClockIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
