import { useState } from "react";
import { Globe, MapPin, Map, Mail, Settings as SettingsIcon } from "lucide-react";
import CountriesList from "./CountriesList";
import CitiesList from "./CitiesList";
import DistrictsList from "./DistrictsList";
import EnquiriesList from "./EnquiriesList";

const TABS = [
  { id: "countries", label: "Ülkeler", icon: Globe },
  { id: "cities", label: "Şehirler", icon: MapPin },
  { id: "districts", label: "İlçeler / Bölgeler", icon: Map },
  { id: "enquiries", label: "Talepler", icon: Mail },
  { id: "general", label: "Genel", icon: SettingsIcon },
];

export default function SettingsView() {
  const [tab, setTab] = useState("countries");

  return (
    <>
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

      <div>
        {tab === "countries" && <CountriesList />}
        {tab === "cities" && <CitiesList />}
        {tab === "districts" && <DistrictsList />}
        {tab === "enquiries" && <EnquiriesList />}
        {tab === "general" && (
          <div className="admin-card admin-form-panel">
            <h3>Genel Ayarlar</h3>
            <p style={{ color: "var(--admin-text-muted)", fontSize: 14, margin: 0 }}>
              Havalimanı, otel ve liman lokasyonları bir sonraki sürümde eklenecektir. Altyapı hazır.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
