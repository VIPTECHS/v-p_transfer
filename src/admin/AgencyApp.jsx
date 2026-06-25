import { useState } from "react";
import AgencyDashboard from "./AgencyDashboard";
import AgencyBookingsList from "./AgencyBookingsList";
import AgencyProfile from "./AgencyProfile";
import { getAgencyInfo } from "../api/admin";

const VIEWS = {
  dashboard: AgencyDashboard,
  bookings: AgencyBookingsList,
  profile: AgencyProfile,
};

const NAV = [
  { id: "dashboard", label: "Panel" },
  { id: "bookings", label: "Randevular" },
  { id: "profile", label: "Profil" },
];

export default function AgencyApp({ onLogout }) {
  const [view, setView] = useState("dashboard");
  const [bookingId, setBookingId] = useState(null);
  const info = getAgencyInfo();
  const ViewComponent = VIEWS[view];

  const navigate = (v, id) => {
    if (v === "booking-detail" && id) {
      setBookingId(id);
      setView("bookings");
    } else {
      setBookingId(null);
      setView(v);
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <h1>VIP Transfer</h1>
            <span>{info?.agencyName || "Acente Paneli"}</span>
          </div>
          <nav className="admin-nav" aria-label="Agency navigation">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={view === id ? "active" : ""}
                onClick={() => navigate(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <a href="/">← Siteye dön</a>
            <button type="button" className="admin-logout" onClick={onLogout}>
              Çıkış yap
            </button>
          </div>
        </aside>
        <main className="admin-main">
          {ViewComponent && <ViewComponent navigate={navigate} bookingId={bookingId} />}
        </main>
      </div>
    </div>
  );
}
