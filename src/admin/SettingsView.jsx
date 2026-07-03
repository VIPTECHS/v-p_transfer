import { useEffect, useState } from "react";
import { Globe, MapPin, Mail, Settings as SettingsIcon } from "lucide-react";
import { fetchCities, fetchCountries, fetchEnquiries } from "../api/admin";
import CountriesList from "./CountriesList";
import CitiesList from "./CitiesList";
import EnquiriesList from "./EnquiriesList";
import { AdminChartCard, AdminPieChart } from "./components/AdminChart";

const TABS = [
  { id: "countries", label: "Ülkeler", icon: Globe },
  { id: "cities", label: "Şehirler", icon: MapPin },
  { id: "enquiries", label: "Talepler", icon: Mail },
  { id: "general", label: "Genel", icon: SettingsIcon },
];

export default function SettingsView() {
  const [tab, setTab] = useState("countries");
  const [overviewChart, setOverviewChart] = useState([]);

  useEffect(() => {
    Promise.all([fetchCountries(), fetchCities(), fetchEnquiries()])
      .then(([countries, cities, enquiries]) => {
        setOverviewChart([
          { label: "Ülkeler", value: countries.length, color: "#3b82f6" },
          { label: "Şehirler", value: cities.length, color: "#16a34a" },
          { label: "Talepler", value: enquiries.length, color: "#f59e0b" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="admin-page-header">
        <h1>Ayarlar</h1>
      </div>

      <div className="settings-tabs">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`settings-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="admin-page-charts">
        <AdminChartCard title="Sistem Özeti" subtitle="Ülke, şehir ve talep kayıt sayıları">
          <AdminPieChart data={overviewChart} />
        </AdminChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        {tab === "countries" && <CountriesList />}
        {tab === "cities" && <CitiesList />}
        {tab === "enquiries" && <EnquiriesList />}
        {tab === "general" && (
          <div className="admin-card">
            <h3 style={{ marginBottom: 12 }}>Genel Ayarlar</h3>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Genel ayarlar yakında eklenecek.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
