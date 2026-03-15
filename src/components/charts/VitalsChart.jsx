import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import clsx from "clsx";

const VITALS_META = {
  LCP:  { label: "Largest Contentful Paint", unit: "ms", good: 2500, poor: 4000, color: "#fbbf24" },
  FCP:  { label: "First Contentful Paint",   unit: "ms", good: 1800, poor: 3000, color: "#38bdf8" },
  FID:  { label: "First Input Delay",        unit: "ms", good: 100,  poor: 300,  color: "#34d399" },
  CLS:  { label: "Cumulative Layout Shift",  unit: "",   good: 0.1,  poor: 0.25, color: "#fb7185" },
};

function getRating(metric, value) {
  const m = VITALS_META[metric];
  if (!m || value == null) return "—";
  if (value <= m.good) return "good";
  if (value <= m.poor) return "needs-improvement";
  return "poor";
}

function VitalGauge({ metric, avg, p75 }) {
  const meta = VITALS_META[metric];
  if (!meta) return null;

  const rating = getRating(metric, avg);
  const ratingColor =
    rating === "good" ? "#34d399" :
    rating === "needs-improvement" ? "#fbbf24" : "#fb7185";

  // Score 0-100 for radial bar
  const maxVal = meta.poor * 1.5;
  const score  = Math.max(0, Math.min(100, 100 - (avg / maxVal) * 100));

  const data = [{ name: metric, value: score, fill: ratingColor }];

  const displayVal = metric === "CLS"
    ? parseFloat(avg).toFixed(3)
    : `${Math.round(avg)}ms`;

  return (
    <div className="bg-surface-3 border border-border rounded-lg p-4 flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30}
            data={data}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: "#1c2030" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono text-xs font-semibold" style={{ color: ratingColor }}>
            {metric}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="mono text-lg font-semibold text-slate-200">{displayVal}</div>
        <div className="mono text-xs text-muted">avg · p75: {metric === "CLS" ? parseFloat(p75).toFixed(3) : `${Math.round(p75)}ms`}</div>
        <div className={clsx(
          "mt-1 text-xs mono px-2 py-0.5 rounded inline-block",
          rating === "good"             ? "bg-emerald-500/15 text-emerald-400" :
          rating === "needs-improvement"? "bg-amber-500/15 text-amber-400"    :
                                          "bg-rose-500/15 text-rose-400"
        )}>
          {rating}
        </div>
      </div>
    </div>
  );
}

export default function VitalsChart({ vitals = [] }) {
  if (!vitals.length) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {["LCP", "FCP", "FID", "CLS"].map((m) => (
          <div key={m} className="bg-surface-3 border border-border rounded-lg p-4 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {["LCP", "FCP", "FID", "CLS"].map((metric) => {
        const v = vitals.find((x) => x.metric === metric);
        if (!v) return <div key={metric} className="bg-surface-3 border border-border rounded-lg p-4 h-48 flex items-center justify-center text-muted mono text-xs">{metric} — no data</div>;
        return (
          <VitalGauge
            key={metric}
            metric={metric}
            avg={parseFloat(v.avg_value)}
            p75={parseFloat(v.p75)}
          />
        );
      })}
    </div>
  );
}
