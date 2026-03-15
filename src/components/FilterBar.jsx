import clsx from "clsx";

const PRESETS = [
  { label: "1h",  value: 1  * 60 * 60 * 1000 },
  { label: "6h",  value: 6  * 60 * 60 * 1000 },
  { label: "24h", value: 24 * 60 * 60 * 1000 },
  { label: "7d",  value: 7  * 24 * 60 * 60 * 1000 },
  { label: "30d", value: 30 * 24 * 60 * 60 * 1000 },
];

export default function FilterBar({ range, setRange, children }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Range presets */}
      <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-lg p-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setRange(p.value)}
            className={clsx(
              "px-3 py-1 rounded text-xs mono transition-all",
              range === p.value
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-muted hover:text-slate-300"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

export function getDateRange(rangeMs) {
  const to   = new Date().toISOString();
  const from = new Date(Date.now() - rangeMs).toISOString();
  return { from, to };
}
