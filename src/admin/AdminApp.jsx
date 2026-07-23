import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, CalendarCheck, ClipboardList, Calendar,
  Users, Building2, Briefcase, Car, UserCog,
  CreditCard, BarChart3, Settings, Menu, X, LogOut,
} from "lucide-react";
import Dashboard from "./Dashboard";
import ReservationsList from "./ReservationsList";
import ReservationDetail from "./ReservationDetail";
import OperationsView from "./OperationsView";
import CalendarView from "./CalendarView";
import CustomersList from "./CustomersList";
import CustomerDetail from "./CustomerDetail";
import SuppliersList from "./SuppliersList";
import SupplierDetail from "./SupplierDetail";
import AgenciesList from "./AgenciesList";
import AgencyDetail from "./AgencyDetail";
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
  operations: OperationsView,
  calendar: CalendarView,
  customers: CustomersList,
  suppliers: SuppliersList,
  agencies: AgenciesList,
  vehicles: VehiclesList,
  drivers: DriversList,
  payments: PaymentsView,
  reports: ReportsView,
  settings: SettingsView,
};

const NAV_GROUPS = [
  {
    label: "Genel",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operasyon",
    items: [
      { id: "reservations", label: "Rezervasyonlar", icon: CalendarCheck },
      { id: "operations", label: "Operasyon", icon: ClipboardList },
      { id: "calendar", label: "Takvim", icon: Calendar },
    ],
  },
  {
    label: "Cari & İş Ortakları",
    items: [
      { id: "customers", label: "Müşteriler", icon: Users },
      { id: "suppliers", label: "Tedarikçiler", icon: Building2 },
      { id: "agencies", label: "Acenteler", icon: Briefcase },
      { id: "payments", label: "Ödemeler", icon: CreditCard },
    ],
  },
  {
    label: "Filo",
    items: [
      { id: "vehicles", label: "Araçlar", icon: Car },
      { id: "drivers", label: "Sürücüler", icon: UserCog },
    ],
  },
  {
    label: "Sistem",
    items: [
      { id: "reports", label: "Raporlar", icon: BarChart3 },
      { id: "settings", label: "Ayarlar", icon: Settings },
    ],
  },
];

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Günün özeti ve operasyon durumu" },
  reservations: { title: "Rezervasyonlar", subtitle: "Referans, kaynak ve transfer bilgileri" },
  operations: { title: "Operasyon", subtitle: "Günlük transfer planı" },
  calendar: { title: "Takvim", subtitle: "Aylık transfer görünümü" },
  customers: { title: "Müşteriler", subtitle: "Müşteri kartları ve iletişim" },
  suppliers: { title: "Tedarikçiler", subtitle: "Tedarikçi firmalar ve belgeler" },
  agencies: { title: "Acenteler", subtitle: "Acente yönetimi ve komisyon" },
  vehicles: { title: "Araçlar", subtitle: "Filo listesi" },
  drivers: { title: "Sürücüler", subtitle: "Sürücü ve bağlantı bilgileri" },
  payments: { title: "Ödemeler", subtitle: "Cari hesap ve tahsilat takibi" },
  reports: { title: "Raporlar", subtitle: "Gelir ve performans analizi" },
  settings: { title: "Ayarlar", subtitle: "Lokasyon ve sistem yapılandırması" },
};

const DETAIL_VIEWS = {
  "reservation-detail": { section: "reservations", Component: ReservationDetail, prop: "id" },
  "supplier-detail": { section: "suppliers", Component: SupplierDetail, prop: "id" },
  "agency-detail": { section: "agencies", Component: AgencyDetail, prop: "id" },
  "customer-detail": { section: "customers", Component: CustomerDetail, prop: "id" },
};

function parseAdminRoute(pathname) {
  const clean = pathname.replace(LANG_PREFIX_RE, "");
  const match = clean.match(/^\/admin(?:\/([^/]+))?(?:\/([^/]+))?/);
  if (!match) return { view: "dashboard" };
  const view = match[1] || "dashboard";
  const id = match[2] || null;
  if (view === "reservation" && id) return { view: "reservation-detail", id };
  if (view === "supplier" && id) return { view: "supplier-detail", id };
  if (view === "agency" && id) return { view: "agency-detail", id };
  if (view === "customer" && id) return { view: "customer-detail", id };
  if (VIEWS[view]) return { view, id };
  return { view: "dashboard" };
}

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(() => hasAdminPassword());
  const [role, setRole] = useState(() => getSessionRole());
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [route.view, route.id]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
    setMenuOpen(false);
    const detailPaths = {
      "reservation-detail": `/admin/reservation/${id}`,
      "supplier-detail": `/admin/supplier/${id}`,
      "agency-detail": `/admin/agency/${id}`,
      "customer-detail": `/admin/customer/${id}`,
    };
    if (detailPaths[view] && id) {
      navigate(detailPaths[view]);
    } else {
      navigate(`/admin/${view === "dashboard" ? "" : view}`);
    }
  };

  const detailConfig = DETAIL_VIEWS[route.view];
  const activeView = detailConfig?.section || route.view;
  const ViewComponent = VIEWS[route.view];
  const pageMeta = PAGE_META[activeView] || PAGE_META.dashboard;
  const isDetail = Boolean(detailConfig);

  const backRoutes = {
    "reservation-detail": "reservations",
    "supplier-detail": "suppliers",
    "agency-detail": "agencies",
    "customer-detail": "customers",
  };

  return (
    <div className={`admin-root${menuOpen ? " admin-root--menu-open" : ""}`}>
      <div className="admin-layout">
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setMenuOpen(false)}
        />

        <aside className={`admin-sidebar${menuOpen ? " admin-sidebar--open" : ""}`}>
          <div className="admin-brand">
            <img
              className="admin-brand__logo"
              src="/images/viptransfer-logo.png"
              alt="VIP Transfer"
            />
            <p className="admin-brand__tag">Yönetim Paneli</p>
            <button
              type="button"
              className="admin-sidebar-close"
              aria-label="Menüyü kapat"
              onClick={() => setMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="admin-nav-group">
                <div className="admin-nav-group__label">{group.label}</div>
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={activeView === id ? "active" : ""}
                    onClick={() => goTo(id)}
                  >
                    <Icon size={18} className="admin-nav-icon" strokeWidth={1.75} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
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
              className="admin-logout-btn"
              onClick={() => {
                clearAdminPassword();
                setAuthenticated(false);
                setRole(null);
              }}
              title="Çıkış yap"
              aria-label="Çıkış yap"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <div className="admin-content">
          <header className="admin-mobile-topbar">
            <button
              type="button"
              className="admin-mobile-menu-btn"
              aria-label="Menüyü aç"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="admin-mobile-topbar-title">{pageMeta.title}</span>
          </header>

          {!isDetail && (
            <header className="admin-topbar">
              <div>
                <h1 className="admin-topbar__title">{pageMeta.title}</h1>
                <p className="admin-topbar__subtitle">{pageMeta.subtitle}</p>
              </div>
            </header>
          )}

          <main className={`admin-main${isDetail ? " admin-main--detail" : ""}`}>
            {detailConfig ? (
              <detailConfig.Component
                id={route.id}
                onBack={() => goTo(backRoutes[route.view])}
                navigate={goTo}
              />
            ) : ViewComponent ? (
              <ViewComponent navigate={goTo} />
            ) : (
              <Dashboard navigate={goTo} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
