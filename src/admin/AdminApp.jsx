import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import CalendarView from "./CalendarView";
import BookingsList from "./BookingsList";
import BookingDetail from "./BookingDetail";
import EnquiriesList from "./EnquiriesList";
import OperationsView from "./OperationsView";
import DriversList from "./DriversList";
import VehiclesList from "./VehiclesList";
import CountriesList from "./CountriesList";
import CitiesList from "./CitiesList";
import AgenciesList from "./AgenciesList";
import AdminLogin from "./AdminLogin";
import AgencyApp from "./AgencyApp";
import { clearAdminPassword, hasAdminPassword, getSessionRole } from "../api/admin";
import { LANG_PREFIX_RE } from "../i18n/locale";
import "./admin.css";

const VIEWS = {
  dashboard: Dashboard,
  calendar: CalendarView,
  bookings: BookingsList,
  enquiries: EnquiriesList,
  operations: OperationsView,
  drivers: DriversList,
  vehicles: VehiclesList,
  countries: CountriesList,
  cities: CitiesList,
  agencies: AgenciesList,
};

const NAV = [
  { id: "dashboard", label: "Panel" },
  { id: "operations", label: "Operasyon" },
  { id: "calendar", label: "Takvim" },
  { id: "bookings", label: "Randevular" },
  { id: "drivers", label: "Şoförler" },
  { id: "vehicles", label: "Araçlar" },
  { id: "enquiries", label: "Talepler" },
  { id: "countries", label: "Ülkeler" },
  { id: "cities", label: "Şehirler" },
  { id: "agencies", label: "Acenteler" },
];

function parseAdminRoute(pathname) {
  const clean = pathname.replace(LANG_PREFIX_RE, "");
  const match = clean.match(/^\/admin(?:\/([^/]+))?(?:\/([^/]+))?/);
  if (!match) return { view: "dashboard" };
  const view = match[1] || "dashboard";
  const id = match[2] || null;
  if (view === "booking" && id) return { view: "booking-detail", id };
  if (VIEWS[view]) return { view, id };
  return { view: "dashboard" };
}

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(() => hasAdminPassword());
  const [role, setRole] = useState(() => getSessionRole());
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" ? parseAdminRoute(window.location.pathname) : { view: "dashboard" },
  );

  useEffect(() => {
    const onPop = () => setRoute(parseAdminRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => { setAuthenticated(false); setRole(null); };
    window.addEventListener("vip-admin-unauthorized", onUnauthorized);
    return () => window.removeEventListener("vip-admin-unauthorized", onUnauthorized);
  }, []);

  const navigate = useCallback((path) => {
    window.history.pushState(null, "", path);
    setRoute(parseAdminRoute(path));
  }, []);

  if (!authenticated) {
    return (
      <AdminLogin onSuccess={() => {
        setAuthenticated(true);
        setRole(getSessionRole());
      }} />
    );
  }

  if (role === "agency") {
    return <AgencyApp onLogout={() => { clearAdminPassword(); setAuthenticated(false); setRole(null); }} />;
  }

  const goTo = (view, id) => {
    if (view === "booking-detail" && id) {
      navigate(`/admin/booking/${id}`);
    } else {
      navigate(`/admin/${view === "dashboard" ? "" : view}`);
    }
  };

  const activeView = route.view === "booking-detail" ? "bookings" : route.view;
  const ViewComponent = VIEWS[route.view];

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <h1>VIP Transfer</h1>
            <span>Yönetim Paneli</span>
          </div>
          <nav className="admin-nav" aria-label="Admin navigation">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={activeView === id ? "active" : ""}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <a href="/">← Siteye dön</a>
            <button
              type="button"
              className="admin-logout"
              onClick={() => {
                clearAdminPassword();
                setAuthenticated(false);
                setRole(null);
              }}
            >
              Çıkış yap
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {route.view === "booking-detail" ? (
            <BookingDetail id={route.id} onBack={() => goTo("bookings")} navigate={goTo} />
          ) : ViewComponent ? (
            <ViewComponent navigate={goTo} />
          ) : (
            <Dashboard navigate={goTo} />
          )}
        </main>
      </div>
    </div>
  );
}
