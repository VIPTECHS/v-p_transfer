import { useEffect, useState } from "react";
import { Plane, ExternalLink } from "lucide-react";
import { fetchFlightStatus } from "../../api/admin";

function toDateParam(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// AeroDataBox returns local times like "2026-07-05 14:30+03:00".
// Show the airport-local HH:MM directly without timezone conversion.
function timePart(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function minutesBetween(a, b) {
  if (!a || !b) return 0;
  const da = new Date(String(a).replace(" ", "T"));
  const db = new Date(String(b).replace(" ", "T"));
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return 0;
  return Math.round((db.getTime() - da.getTime()) / 60000);
}

function classify(data) {
  const raw = (data.status || "").toLowerCase();
  if (data.isCancelled || raw.includes("cancel")) return { tone: "red", label: "İptal" };
  if (raw.includes("arriv") || raw.includes("landed")) return { tone: "green", label: "İndi" };
  if (raw.includes("divert")) return { tone: "red", label: "Yönlendirildi" };
  const delay = minutesBetween(data.arrival?.scheduled, data.arrival?.revised);
  if (raw.includes("delay") || delay >= 15) {
    return { tone: "amber", label: delay >= 15 ? `Rötarlı +${delay}dk` : "Rötarlı" };
  }
  if (raw.includes("enroute") || raw.includes("air") || raw.includes("depart") || raw.includes("board") || raw.includes("approach")) {
    return { tone: "blue", label: "Yolda" };
  }
  if (raw.includes("expect") || raw.includes("schedul") || raw.includes("checkin") || raw.includes("unknown") || !raw) {
    return { tone: "gray", label: "Planlandı" };
  }
  return { tone: "gray", label: data.status };
}

export default function FlightStatus({ code, date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const clean = (code || "").trim().toUpperCase().replace(/\s+/g, "");

  useEffect(() => {
    if (!clean) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchFlightStatus(clean, toDateParam(date))
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setData({ error: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [clean, date]);

  if (!clean) return null;

  const trackUrl = `https://www.flightradar24.com/data/flights/${clean.toLowerCase()}`;
  const trackLink = (
    <a
      className="flight-track-link"
      href={trackUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      <Plane size={12} />
      {clean}
      <ExternalLink size={11} />
    </a>
  );

  if (loading) {
    return <span className="flight-chip flight-chip--loading"><Plane size={12} /> {clean}…</span>;
  }

  // No API key configured, upstream error, or flight not found → deep link only.
  if (!data || data.error || data.configured === false || data.found === false) {
    return trackLink;
  }

  const { tone, label } = classify(data);
  const eta = timePart(data.arrival?.revised) || timePart(data.arrival?.scheduled);
  const term = data.arrival?.terminal;
  const belt = data.arrival?.baggageBelt;

  return (
    <span className="flight-status" onClick={(e) => e.stopPropagation()}>
      <a
        className={`flight-chip flight-chip--${tone}`}
        href={trackUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${data.airline || ""} ${data.flightNumber} — ${data.status}`}
      >
        <Plane size={12} />
        {clean}
        <span className="flight-chip-state">{label}</span>
      </a>
      {eta && <span className="flight-meta">Varış {eta}</span>}
      {term && <span className="flight-meta">Term. {term}</span>}
      {belt && <span className="flight-meta">Bant {belt}</span>}
    </span>
  );
}
