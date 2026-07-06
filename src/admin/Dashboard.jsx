import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Users,
  Building2,
  TrendingUp,
  PlaneLanding,
  PlaneTakeoff,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  StickyNote,
  ExternalLink,
  Car,
  UserCog,
} from "lucide-react";
import { fetchReservations, fetchCustomers, fetchSuppliers, fetchPaymentSummary } from "../api/admin";
import { getMonthMatrix, isSameDay, startOfDay } from "../utils/datetime";
import StatusBadge from "./components/StatusBadge";
import FlightStatus from "./components/FlightStatus";
import { AdminChartCard, AdminPieChart, countBy } from "./components/AdminChart";

const STATUS_LABELS = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const pad = (n) => String(n).padStart(2, "0");

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR");
}

function customerName(customer) {
  if (!customer) return "—";
  return `${customer.firstName} ${customer.lastName || ""}`.trim();
}

const PAYMENT_LABELS = {
  paid: { label: "Ödendi", cls: "paid" },
  partial: { label: "Kısmi", cls: "partial" },
  unpaid: { label: "Ödenmedi", cls: "unpaid" },
};

function currencySymbol(code) {
  if (code === "EUR") return "€";
  if (code === "USD") return "$";
  if (code === "TRY" || code === "TL") return "₺";
  if (code === "GBP") return "£";
  return code ? `${code} ` : "";
}

function phoneDigits(phone) {
  if (!phone) return "";
  return phone.replace(/[^\d]/g, "");
}

function passengerSummary(list) {
  if (!list || list.length === 0) return null;
  const names = list
    .map((p) => `${p.firstName || ""} ${p.lastName || ""}`.trim())
    .filter(Boolean);
  return { count: list.length, names };
}

function transferTimeLabel(tr) {
  if (tr.transferTime) return tr.transferTime;
  const d = new Date(tr.transferDate);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeMinutes(tr) {
  const [h, m] = transferTimeLabel(tr).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function StatCard({ tone, icon, value, label, onClick }) {
  return (
    <div
      className={`admin-stat-card admin-stat-card--link${tone ? ` admin-stat-card--${tone}` : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}

function TransferTypeTag({ type }) {
  if (type === "departure") {
    return (
      <span className="dash-tr-type dash-tr-type--dep">
        <PlaneTakeoff size={13} /> Gidiş
      </span>
    );
  }
  return (
    <span className="dash-tr-type dash-tr-type--arr">
      <PlaneLanding size={13} /> Karşılama
    </span>
  );
}

export default function Dashboard({ navigate }) {
  const [reservations, setReservations] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    Promise.all([
      fetchReservations(),
      fetchCustomers(),
      fetchSuppliers(),
      fetchPaymentSummary().catch(() => null),
    ])
      .then(([r, c, s, ps]) => {
        setReservations(r);
        setCustomerCount(c.length);
        setSupplierCount(s.length);
        setSummary(ps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flatten every transfer of every reservation, indexed by day.
  const transfersByDay = useMemo(() => {
    const map = new Map();
    for (const r of reservations) {
      for (const tr of r.transfers || []) {
        if (!tr.transferDate) continue;
        const day = startOfDay(new Date(tr.transferDate));
        if (Number.isNaN(day.getTime())) continue;
        const key = day.getTime();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({
          ...tr,
          reservationId: r.id,
          reference: r.reference,
          customer: r.customer,
          passengers: r.passengers || [],
          vehicle: r.assignedVehicle?.name || null,
          driver: r.assignedDriver?.name || null,
          resStatus: r.status,
          salePrice: r.salePrice,
          saleCurrency: r.saleCurrency,
          customerPaymentStatus: r.customerPaymentStatus,
          customerNote: r.customerNote,
        });
      }
    }
    return map;
  }, [reservations]);

  const dayTransfers = useMemo(() => {
    const list = transfersByDay.get(startOfDay(selectedDay).getTime()) || [];
    return [...list].sort((a, b) => timeMinutes(a) - timeMinutes(b));
  }, [transfersByDay, selectedDay]);

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;

  const pending = reservations.filter((r) => r.status === "pending").length;
  const cells = getMonthMatrix(viewDate);
  const today = startOfDay(new Date());
  const todayCount = (transfersByDay.get(today.getTime()) || []).length;
  const isTodaySelected = isSameDay(selectedDay, today);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(startOfDay(now));
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Panel</h1>
      </div>

      <div className="admin-stats-row admin-dash-stats">
        <StatCard
          icon={<CalendarCheck size={20} />}
          value={reservations.length}
          label="Toplam Rezervasyon"
          onClick={() => navigate("reservations")}
        />
        <StatCard
          tone="yellow"
          icon={<CalendarCheck size={20} />}
          value={pending}
          label="Bekleyen"
          onClick={() => navigate("reservations")}
        />
        <StatCard
          tone="blue"
          icon={<Users size={20} />}
          value={customerCount}
          label="Müşteri"
          onClick={() => navigate("customers")}
        />
        <StatCard
          tone="green"
          icon={<Building2 size={20} />}
          value={supplierCount}
          label="Tedarikçi"
          onClick={() => navigate("suppliers")}
        />
        {summary && (
          <StatCard
            tone="green"
            icon={<TrendingUp size={20} />}
            value={`€ ${(summary.totalProfit || 0).toFixed(2).replace(".", ",")}`}
            label="Toplam Kâr"
            onClick={() => navigate("reports")}
          />
        )}
      </div>

      {/* Calendar + today's transfers */}
      <div className="admin-card dash-planner">
        <div className="dash-planner-cal">
          <div className="dash-cal-toolbar">
            <strong>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</strong>
            <div className="dash-cal-nav">
              <button type="button" onClick={prevMonth} aria-label="Önceki ay"><ChevronLeft size={16} /></button>
              <button type="button" onClick={goToday}>Bugün</button>
              <button type="button" onClick={nextMonth} aria-label="Sonraki ay"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="dash-cal-grid">
            {WEEKDAYS.map((d) => (
              <div key={d} className="dash-cal-weekday">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="dash-cal-cell dash-cal-cell--empty" />;
              const count = (transfersByDay.get(day.getTime()) || []).length;
              const cls = [
                "dash-cal-cell",
                isSameDay(day, today) ? "dash-cal-cell--today" : "",
                isSameDay(day, selectedDay) ? "dash-cal-cell--selected" : "",
                count ? "dash-cal-cell--has" : "",
              ].filter(Boolean).join(" ");
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={cls}
                  onClick={() => setSelectedDay(startOfDay(day))}
                >
                  <span>{day.getDate()}</span>
                  {count > 0 && <span className="dash-cal-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dash-planner-list">
          <div className="dash-list-head">
            <div>
              <h2>{isTodaySelected ? "Bugünkü Transferler" : "Transferler"}</h2>
              <span className="dash-list-sub">
                {selectedDay.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{dayTransfers.length} transfer
              </span>
            </div>
            {!isTodaySelected && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={goToday}>Bugüne dön</button>
            )}
          </div>

          {dayTransfers.length === 0 ? (
            <div className="admin-empty">Bu gün için transfer yok</div>
          ) : (
            <div className="dash-tr-scroll">
              {dayTransfers.map((tr) => {
                const pax = passengerSummary(tr.passengers);
                const payment = PAYMENT_LABELS[tr.customerPaymentStatus];
                const wa = phoneDigits(tr.customer?.phone);
                const note = tr.notes || tr.customerNote;
                const stop = (e) => e.stopPropagation();
                return (
                  <div
                    key={tr.id}
                    className="dash-tr-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("reservation-detail", tr.reservationId)}
                    onKeyDown={(e) => e.key === "Enter" && navigate("reservation-detail", tr.reservationId)}
                  >
                    <div className="dash-tr-time">
                      <span className="dash-tr-time-val">{transferTimeLabel(tr)}</span>
                      <TransferTypeTag type={tr.type} />
                    </div>

                    <div className="dash-tr-body">
                      <div className="dash-tr-top">
                        <strong>{customerName(tr.customer)}</strong>
                        <span className="dash-tr-ref">#{tr.reference}</span>
                        {payment && <span className={`dash-pay dash-pay--${payment.cls}`}>{payment.label}</span>}
                        {tr.salePrice != null && (
                          <span className="dash-tr-price">
                            {currencySymbol(tr.saleCurrency)}{(tr.salePrice || 0).toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>

                      <div className="dash-tr-route">
                        <span>{tr.fromLabel}</span>
                        <ArrowRight size={13} />
                        <span>{tr.toLabel}</span>
                      </div>

                      <div className="dash-tr-chips">
                        {pax && (
                          <span className="dash-chip" title={pax.names.join(", ")}>
                            <Users size={12} />
                            {pax.count} yolcu{pax.names.length ? ` · ${pax.names[0]}${pax.count > 1 ? ` +${pax.count - 1}` : ""}` : ""}
                          </span>
                        )}
                        {tr.customer?.phone && <span className="dash-chip"><Phone size={12} />{tr.customer.phone}</span>}
                        {tr.vehicle && <span className="dash-chip"><Car size={12} />{tr.vehicle}</span>}
                        {tr.driver && <span className="dash-chip"><UserCog size={12} />{tr.driver}</span>}
                      </div>

                      {tr.flightCode && (
                        <div className="dash-tr-foot">
                          <FlightStatus code={tr.flightCode} date={tr.transferDate} />
                        </div>
                      )}

                      {note && (
                        <div className="dash-tr-note">
                          <StickyNote size={12} />
                          <span>{note}</span>
                        </div>
                      )}

                      <div className="dash-tr-actions">
                        {tr.customer?.phone && (
                          <a className="dash-act" href={`tel:${tr.customer.phone}`} onClick={stop}>
                            <Phone size={13} /> Ara
                          </a>
                        )}
                        {wa && (
                          <a
                            className="dash-act dash-act--wa"
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          className="dash-act"
                          onClick={(e) => { stop(e); navigate("reservation-detail", tr.reservationId); }}
                        >
                          <ExternalLink size={13} /> Detay
                        </button>
                      </div>
                    </div>

                    <StatusBadge status={tr.resStatus} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="admin-page-charts">
        <AdminChartCard title="Rezervasyon Durumları" subtitle="Duruma göre dağılım">
          <AdminPieChart data={countBy(reservations, (r) => r.status, STATUS_LABELS)} />
        </AdminChartCard>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Son Rezervasyonlar</h2>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("reservations")}>
            Tümünü gör
          </button>
        </div>
        {reservations.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Müşteri</th>
                <th>Tedarikçi</th>
                <th>Tarih</th>
                <th>Satış</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {reservations.slice(0, 10).map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate("reservation-detail", r.id)}>
                  <td><strong>#{r.reference}</strong></td>
                  <td>{r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "—"}</td>
                  <td>{r.supplier?.name || "—"}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{r.saleCurrency === "EUR" ? "€" : r.saleCurrency} {(r.salePrice || 0).toFixed(2).replace(".", ",")}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">Henüz rezervasyon yok</div>
        )}
      </div>
    </>
  );
}
