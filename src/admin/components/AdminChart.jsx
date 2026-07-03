const DEFAULT_COLORS = ["#3b82f6", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280", "#06b6d4", "#ec4899"];

export function countBy(items, keyFn, labelMap = {}) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([key, value], index) => ({
      label: labelMap[key] || key,
      value,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function AdminChartCard({ title, subtitle, children }) {
  return (
    <div className="admin-chart-card">
      <div className="admin-chart-card-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function polar(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function arcPath(cx, cy, r, innerR, startAngle, endAngle) {
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  const outerStart = polar(cx, cy, r, startAngle);
  const outerEnd = polar(cx, cy, r, endAngle);
  const innerEnd = polar(cx, cy, innerR, endAngle);
  const innerStart = polar(cx, cy, innerR, startAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r} ${r} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function AdminPieChart({ data, size = 168 }) {
  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <div className="admin-chart-empty">Gösterilecek veri yok</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const innerR = r * 0.58;
  let cumulative = 0;

  const paths = slices.map((slice, index) => {
    const start = cumulative / total * Math.PI * 2 - Math.PI / 2;
    cumulative += slice.value;
    const end = cumulative / total * Math.PI * 2 - Math.PI / 2;
    return {
      ...slice,
      d: arcPath(cx, cy, r, innerR, start, end),
      color: slice.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  return (
    <div className="admin-pie-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pasta grafik">
        {paths.map((slice) => (
          <path key={slice.label} d={slice.d} fill={slice.color} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="admin-pie-total">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="admin-pie-total-label">toplam</text>
      </svg>
      <ul className="admin-chart-legend">
        {paths.map((slice) => (
          <li key={slice.label}>
            <span className="admin-chart-legend-dot" style={{ background: slice.color }} />
            <span className="admin-chart-legend-label">{slice.label}</span>
            <span className="admin-chart-legend-value">
              {slice.value}
              <em>{Math.round((slice.value / total) * 100)}%</em>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminBarChart({ data, valueFormatter = (v) => v }) {
  const rows = data.filter((d) => d.value >= 0);
  const max = Math.max(...rows.map((d) => d.value), 1);

  if (rows.length === 0 || rows.every((d) => d.value === 0)) {
    return <div className="admin-chart-empty">Gösterilecek veri yok</div>;
  }

  return (
    <div className="admin-bar-chart">
      {rows.map((row, index) => (
        <div key={row.label} className="admin-bar-row">
          <span className="admin-bar-label" title={row.label}>{row.label}</span>
          <div className="admin-bar-track">
            <div
              className="admin-bar-fill"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: row.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
              }}
            />
          </div>
          <span className="admin-bar-value">{valueFormatter(row.value)}</span>
        </div>
      ))}
    </div>
  );
}
