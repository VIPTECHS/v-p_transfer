const SOURCE_LABELS = {
  web: "WEB",
  agency: "Acente",
  manual: "Manuel",
  api: "API",
};

export default function SourceBadge({ source, agency, sourceLabel }) {
  let label = SOURCE_LABELS[source] || source || "Manuel";
  if (source === "agency" && agency?.name) label = agency.name;
  if (source === "api" && sourceLabel) label = sourceLabel;

  const cls = source === "web" ? "web" : source === "agency" ? "agency" : source === "api" ? "api" : "manual";
  return <span className={`reservation-source-badge reservation-source-badge--${cls}`}>{label}</span>;
}
