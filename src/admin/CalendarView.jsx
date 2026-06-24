import { useEffect, useMemo, useState } from "react";
import { getMonthMatrix, isSameDay, startOfDay } from "../utils/datetime";
import { fetchBookings } from "../api/admin";
import {
  bookingsForDay,
  customerName,
  formatMonthYear,
  formatTime,
  statusLabel,
} from "./utils";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function CalendarView({ navigate }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthStart = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
    [viewDate],
  );
  const monthEnd = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0),
    [viewDate],
  );

  useEffect(() => {
    setLoading(true);
    fetchBookings({
      from: monthStart.toISOString(),
      to: monthEnd.toISOString(),
    })
      .then(setBookings)
      .catch(() => setError("Randevular yüklenemedi"))
      .finally(() => setLoading(false));
  }, [monthStart, monthEnd]);

  const cells = useMemo(() => getMonthMatrix(viewDate), [viewDate]);
  const today = startOfDay(new Date());
  const dayBookings = bookingsForDay(bookings, selectedDay);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(startOfDay(now));
  };

  return (
    <>
      <h1 className="admin-page-title">Takvim</h1>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-calendar-toolbar">
        <div className="admin-calendar-nav">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={prevMonth}>
            ←
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={goToday}>
            Bugün
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={nextMonth}>
            →
          </button>
        </div>
        <h2>{formatMonthYear(viewDate)}</h2>
        <div className="admin-view-tabs">
          <button type="button" className="active">Ay</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor...</div>
      ) : (
        <>
          <div className="admin-calendar-grid">
            {WEEKDAYS.map((d) => (
              <div key={d} className="admin-calendar-weekday">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="admin-calendar-day admin-calendar-day--empty" />;
              }

              const dayItems = bookingsForDay(bookings, day);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);

              return (
                <div
                  key={day.toISOString()}
                  className={[
                    "admin-calendar-day",
                    isToday ? "admin-calendar-day--today" : "",
                    isSelected ? "admin-calendar-day--selected" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedDay(startOfDay(day))}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedDay(startOfDay(day))}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-calendar-day-num">{day.getDate()}</div>
                  {dayItems.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className={`admin-calendar-event admin-calendar-event--${b.status}`}
                      title={`${customerName(b)} — ${formatTime(b.pickupAt)}`}
                    >
                      {formatTime(b.pickupAt)} {customerName(b)}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="admin-calendar-event">+{dayItems.length - 3} daha</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="admin-day-panel">
            <h3>
              {selectedDay.toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" "}
              ({dayBookings.length} randevu)
            </h3>

            {dayBookings.length === 0 ? (
              <div className="admin-empty">Bu gün için randevu yok</div>
            ) : (
              dayBookings
                .sort((a, b) => new Date(a.pickupAt) - new Date(b.pickupAt))
                .map((b) => (
                  <div
                    key={b.id}
                    className="admin-booking-card"
                    onClick={() => navigate("booking-detail", b.id)}
                    onKeyDown={(e) => e.key === "Enter" && navigate("booking-detail", b.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="admin-booking-card-header">
                      <strong>{customerName(b)}</strong>
                      <span className={`admin-badge admin-badge--${b.status}`}>
                        {statusLabel(b.status)}
                      </span>
                    </div>
                    <div className="admin-booking-card-meta">
                      <div>{formatTime(b.pickupAt)} · {b.reference}</div>
                      <div>{b.phone} · {b.email}</div>
                    </div>
                    <div className="admin-booking-card-route">
                      {b.fromLabel}
                      {b.toLabel ? ` → ${b.toLabel}` : b.durationHours ? ` (${b.durationHours} saat)` : ""}
                    </div>
                    {b.vehicle && (
                      <div className="admin-booking-card-meta">Araç: {b.vehicle}</div>
                    )}
                  </div>
                ))
            )}
          </div>
        </>
      )}
    </>
  );
}
