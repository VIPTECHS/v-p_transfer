import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, CalendarCheck, ArrowLeftRight,
  Users, Building2, Car, UserCog,
  CreditCard, BarChart3, Settings, ChevronUp,
} from "lucide-react";
import Dashboard from "./Dashboard";
import ReservationsList from "./ReservationsList";
import ReservationDetail from "./ReservationDetail";
import TransfersList from "./TransfersList";
import CustomersList from "./CustomersList";
import SuppliersList from "./SuppliersList";
import DriversList from "./DriversList";
import VehiclesList from "./VehiclesList";
import PaymentsView from "./PaymentsView";
import ReportsView from "./ReportsView";
import SettingsView from "./SettingsView";
import AdminLogin from "./AdminLogin";
import { clearAdminPassword, hasAdminPassword, getSessionRole } from "../api/admin";
import { LANG_PREFIX_RE } from "../i18n/locale";
import "./admin.css";

const VIEWS = {
  dashboard: Dashboard,
  reservations: ReservationsList,
  transfers: TransfersList,
  customers: CustomersList,
  suppliers: SuppliersList,
  vehicles: VehiclesList,
  drivers: DriversList,
  payments: PaymentsView,
  reports: ReportsView,
  settings: SettingsView,
};

const NAV = [
  { id: "dashboard", label: "Panel", icon: LayoutDashboard },
  { id: "reservations", label: "Rezervasyonlar", icon: CalendarCheck },
  { id: "transfers", label: "Transferler", icon: ArrowLeftRight },
  { id: "customers", label: "Müşteriler", icon: Users },
  { id: "suppliers", label: "Tedarikçiler", icon: Building2 },
  { id: "vehicles", label: "Araçlar", icon: Car },
  { id: "drivers", label: "Sürücüler", icon: UserCog },
  { id: "payments", label: "Ödemeler", icon: CreditCard },
  { id: "reports", label: "Raporlar", icon: BarChart3 },
  { id: "settings", label: "Ayarlar", icon: Settings },
];

function parseAdminRoute(pathname) {
  const clean = pathname.replace(LANG_PREFIX_RE, "");
  const match = clean.match(/^\/admin(?:\/([^/]+))?(?:\/([^/]+))?/);
  if (!match) return { view: "dashboard" };
  const view = match[1] || "dashboard";
  const id = match[2] || null;
  if (view === "reservation" && id) return { view: "reservation-detail", id };
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

  const goTo = (view, id) => {
    if (view === "reservation-detail" && id) {
      navigate(`/admin/reservation/${id}`);
    } else {
      navigate(`/admin/${view === "dashboard" ? "" : view}`);
    }
  };

  const activeView = route.view === "reservation-detail" ? "reservations" : route.view;
  const ViewComponent = VIEWS[route.view];

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <h1><span className="brand-vip">VIP</span>TRANSFER.COM</h1>
          </div>
          <nav className="admin-nav" aria-label="Admin navigation">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={activeView === id ? "active" : ""}
                onClick={() => goTo(id)}
              >
                <Icon size={18} className="admin-nav-icon" />
                {label}
              </button>
            ))}
          </nav>
          <div className="admin-avatar">
            <div className="admin-avatar-circle">A</div>
            <div className="admin-avatar-info">
              <div className="admin-avatar-name">Admin</div>
              <div className="admin-avatar-email">admin@viptransfer.com</div>
            </div>
            <button
              type="button"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}
              onClick={() => {
                clearAdminPassword();
                setAuthenticated(false);
                setRole(null);
              }}
              title="Çıkış yap"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {route.view === "reservation-detail" ? (
            <ReservationDetail id={route.id} onBack={() => goTo("reservations")} navigate={goTo} />
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
