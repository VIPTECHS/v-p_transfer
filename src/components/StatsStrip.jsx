import { useI18n } from "../i18n/I18nContext";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
    </svg>
  );
}

function AirportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 2s2 2 2 6v3l6 3.5V18l-6-1.5V20l2 1.5V22l-4-1-4 1v-.5L10 20v-3.5L4 18v-.5L10 14v-3c0-4 2-6 2-6z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.4.6 4 2.7 4 5.2" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" />
      <path d="M3 13h18" />
      <circle cx="7" cy="16" r="1" />
      <circle cx="17" cy="16" r="1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const ICONS = {
  countries: GlobeIcon,
  airports: AirportIcon,
  customers: PeopleIcon,
  vehicles: CarIcon,
  support: ShieldIcon,
};

const KEYS = ["countries", "airports", "customers", "vehicles", "support"];

export default function StatsStrip() {
  const { t } = useI18n();

  return (
    <section className="stats-strip" aria-label="VIP Transfer">
      <div className="stats-strip-inner">
        {KEYS.map((key) => {
          const Icon = ICONS[key];
          return (
            <div className="stats-strip-item" key={key}>
              <span className="stats-strip-icon">
                <Icon />
              </span>
              <div className="stats-strip-copy">
                <strong>{t(`statsStrip.${key}.value`)}</strong>
                <span>{t(`statsStrip.${key}.label`)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
