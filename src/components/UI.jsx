import clsx from "clsx";

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];
  return (
    <div className={clsx("border-2 border-surface-4 border-t-amber-400 rounded-full animate-spin", s)} />
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────
export function LoadingPane() {
  return (
    <div className="flex items-center justify-center h-48 gap-3 text-muted">
      <Spinner />
      <span className="mono text-sm">fetching data...</span>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
export function ErrorPane({ message }) {
  return (
    <div className="flex items-center justify-center h-48 gap-2 text-rose-400">
      <span className="mono text-sm">⚠ {message || "Failed to load"}</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyPane({ message = "No data found" }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted">
      <span className="text-2xl opacity-30">◇</span>
      <span className="mono text-xs">{message}</span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = "amber", icon, trend }) {
  const accents = {
    amber:   "border-amber-500/30 bg-amber-500/5",
    rose:    "border-rose-500/30 bg-rose-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    sky:     "border-sky-500/30 bg-sky-500/5",
  };
  const textAccents = {
    amber: "text-amber-400", rose: "text-rose-400",
    emerald: "text-emerald-400", sky: "text-sky-400",
  };

  return (
    <div className={clsx(
      "relative rounded-lg border p-5 overflow-hidden",
      "bg-surface-2 transition-all duration-200 hover:bg-surface-3",
      accents[accent]
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs mono text-muted uppercase tracking-widest">{label}</span>
        {icon && <span className={clsx("text-lg opacity-60", textAccents[accent])}>{icon}</span>}
      </div>
      <div className={clsx("text-3xl font-semibold mono", textAccents[accent])}>{value ?? "—"}</div>
      {sub && <div className="text-xs text-muted mt-1 mono">{sub}</div>}
      {trend != null && (
        <div className={clsx("text-xs mono mt-2", trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </div>
      )}
      {/* Decorative corner */}
      <div className={clsx(
        "absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5",
        accent === "amber" ? "bg-amber-400" :
        accent === "rose"  ? "bg-rose-400"  :
        accent === "sky"   ? "bg-sky-400"   : "bg-emerald-400"
      )} />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-surface-4 text-muted",
    good:    "bg-emerald-500/15 text-emerald-400",
    warn:    "bg-amber-500/15 text-amber-400",
    poor:    "bg-rose-500/15 text-rose-400",
    info:    "bg-sky-500/15 text-sky-400",
  };
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs mono font-medium", styles[variant])}>
      {children}
    </span>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h2>
        {sub && <p className="text-xs text-muted mt-0.5 mono">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
export function DataTable({ columns, rows, keyField = "id", onRow }) {
  if (!rows?.length) return <EmptyPane />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-2 px-3 text-xs mono text-muted uppercase tracking-wider font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row[keyField] || i}
              onClick={() => onRow?.(row)}
              className={clsx(
                "border-b border-border/50 transition-colors",
                onRow ? "cursor-pointer hover:bg-surface-3" : "hover:bg-surface-2/50"
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 px-3 text-slate-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Panel (card wrapper) ─────────────────────────────────────────────────────
export function Panel({ children, className }) {
  return (
    <div className={clsx("bg-surface-2 border border-border rounded-lg p-5", className)}>
      {children}
    </div>
  );
}

// ─── Rating badge ─────────────────────────────────────────────────────────────
export function RatingBadge({ rating }) {
  const map = {
    "good":             "good",
    "needs-improvement":"warn",
    "poor":             "poor",
  };
  return <Badge variant={map[rating] || "default"}>{rating || "—"}</Badge>;
}

// ─── HTTP Status badge ────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const v = !status ? "default" : status < 300 ? "good" : status < 500 ? "warn" : "poor";
  return <Badge variant={v}>{status || "ERR"}</Badge>;
}

// ─── Method badge ─────────────────────────────────────────────────────────────
export function MethodBadge({ method }) {
  const colors = {
    GET: "text-sky-400", POST: "text-emerald-400",
    PUT: "text-amber-400", PATCH: "text-amber-400",
    DELETE: "text-rose-400",
  };
  return <span className={clsx("mono text-xs font-semibold", colors[method] || "text-muted")}>{method}</span>;
}
