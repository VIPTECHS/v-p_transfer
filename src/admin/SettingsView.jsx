import { useState } from "react";
import { Globe, MapPin, Mail, Settings as SettingsIcon } from "lucide-react";
import CountriesList from "./CountriesList";
import CitiesList from "./CitiesList";
import EnquiriesList from "./EnquiriesList";

const TABS = [
  { id: "countries", label: "Ülkeler", icon: Globe },
  { id: "cities", label: "Şehirler", icon: MapPin },
  { id: "enquiries", label: "Talepler", icon: Mail },
  { id: "general", label: "Genel", icon: SettingsIcon },
];

export default function SettingsView() {
  const [tab, setTab] = useState("countries");

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
