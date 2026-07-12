import { useEffect, useMemo, useState } from "react";
import { getMonthMatrix, isSameDay, startOfDay } from "../utils/datetime";
import { fetchCalendarTransfers } from "../api/admin";
import { formatMonthYear, formatTime } from "./utils";
import StatusBadge from "./components/StatusBadge";
import AdminToolbar from "./components/AdminToolbar";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function CalendarView({ navigate }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStart = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
    [viewDate],
  );
  const monthEnd = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59),
    [viewDate],
  );

  useEffect(() => {
    setLoading(true);
    fetchCalendarTransfers({ from: monthStart.toISOString(), to: monthEnd.toISOString() })
      .then(setTransfers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [monthStart, monthEnd]);

  const cells = useMemo(() => getMonthMatrix(viewDate), [viewDate]);
  const today = startOfDay(new Date());

  const dayTransfers = transfers.filter((t) => isSameDay(new Date(t.transferDate), selectedDay));

  const countForDay = (day) => transfers.filter((t) => isSameDay(new Date(t.transferDate), day)).length;

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(startOfDay(now));
  };

  return (
    <>
      <AdminToolbar>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={prevMonth} aria-label="Önceki ay">←</button>
        <strong className="admin-toolbar-label">{formatMonthYear(viewDate)}</strong>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={nextMonth} aria-label="Sonraki ay">→</button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={goToday}>Bugün</button>
      </AdminToolbar>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <>
          <div className="admin-calendar-grid">
            {WEEKDAYS.map((d) => <div key={d} className="admin-calendar-weekday">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="admin-calendar-cell admin-calendar-cell--empty" />;
              const count = countForDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`admin-calendar-cell${isToday ? " admin-calendar-cell--today" : ""}${isSelected ? " admin-calendar-cell--selected" : ""}`}
                  onClick={() => setSelectedDay(startOfDay(day))}
                >
                  <span>{day.getDate()}</span>
                  {count > 0 && <span className="admin-calendar-count">{count}</span>}
                </button>
              );
            })}
          </div>

          <h2 className="admin-section-title">
            {selectedDay.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
          </h2>

          {dayTransfers.length === 0 ? (
            <div className="admin-empty">Bu gün transfer yok</div>
          ) : (
            dayTransfers.map((t) => (
              <div key={t.id} className="admin-booking-card admin-booking-card--clickable" onClick={() => navigate("reservation-detail", t.reservationId)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("reservation-detail", t.reservationId)}>
                <div className="admin-booking-card-header">
                  <strong>{formatTime(t.transferDate)} — {t.customerName}</strong>
                  <StatusBadge status={t.status} />
                </div>
                <div className="admin-booking-card-route">{t.fromLabel} → {t.toLabel}</div>
                <div className="admin-booking-card-meta">#{t.reference} · {t.supplierName}</div>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}
