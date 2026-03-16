import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  Panel,
  SectionHeader,
  DataTable,
  LoadingPane,
  ErrorPane,
  MethodBadge,
  StatusBadge,
  Badge,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import { format } from "date-fns";

const fmt = (n, d = 0) => (n == null ? "—" : Number(n).toFixed(d));

function maskUrl(url) {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname; // shows only /api/orders/:id, hides domain
  } catch {
    return url.replace(/https?:\/\/[^/]+/, "***"); // fallback
  }
}

export default function ApiCalls({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const [slowOnly, setSlowOnly] = useState(false);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data, loading, error } = useFetch(
    () =>
      api.apiCalls({
        appId: appId || undefined,
        from,
        to,
        slow: slowOnly ? "true" : undefined,
        limit: 100,
      }),
    [appId, from, to, slowOnly],
    30000,
  );

  const endpointColumns = [
    {
      key: "method",
      label: "Method",
      render: (v) => <MethodBadge method={v} />,
    },
    {
      key: "url",
      label: "Endpoint",
      render: (v) => (
        <span className="mono text-xs text-slate-300">{maskUrl(v)}</span>
      ),
    },
    {
      key: "call_count",
      label: "Calls",
      render: (v) => (
        <span className="mono text-sm font-semibold text-sky-400">{v}</span>
      ),
    },
    {
      key: "avg_ms",
      label: "Avg",
      render: (v) => (
        <span className="mono text-xs text-slate-300">{fmt(v)}ms</span>
      ),
    },
    {
      key: "p95_ms",
      label: "p95",
      render: (v) => (
        <span className="mono text-xs text-amber-400">{fmt(v)}ms</span>
      ),
    },
    {
      key: "max_ms",
      label: "Max",
      render: (v) => (
        <span
          className={`mono text-xs ${v > 2000 ? "text-rose-400" : "text-slate-300"}`}
        >
          {fmt(v)}ms
        </span>
      ),
    },
    {
      key: "error_count",
      label: "Errors",
      render: (v) => (
        <span
          className={`mono text-xs ${v > 0 ? "text-rose-400" : "text-muted"}`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "slow_count",
      label: "Slow",
      render: (v) => (
        <span
          className={`mono text-xs ${v > 0 ? "text-amber-400" : "text-muted"}`}
        >
          {v}
        </span>
      ),
    },
  ];

  const rawColumns = [
    {
      key: "timestamp",
      label: "Time",
      render: (v) => (
        <span className="mono text-xs text-muted">
          {v ? format(new Date(v), "HH:mm:ss") : "—"}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (v) => <MethodBadge method={v} />,
    },
    {
      key: "url",
      label: "URL",
      render: (v) => (
        <span className="mono text-xs text-slate-300 truncate max-w-xs block">
          {maskUrl(v)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "duration_ms",
      label: "Duration",
      render: (v, row) => (
        <span
          className={`mono text-xs font-medium ${row.slow ? "text-amber-400" : "text-slate-300"}`}
        >
          {v}ms {row.slow && "⚡"}
        </span>
      ),
    },
    {
      key: "page",
      label: "Page",
      render: (v) => (
        <span className="mono text-xs text-muted">{v || "—"}</span>
      ),
    },
    {
      key: "user_id",
      label: "User",
      render: (v) => (
        <span className="mono text-xs text-sky-400">{v || "anon"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">API Calls</h1>
          <p className="text-xs mono text-muted mt-0.5">
            network requests captured by the SDK
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar range={range} setRange={setRange} />
          <button
            onClick={() => setSlowOnly(!slowOnly)}
            className={`px-3 py-1.5 rounded text-xs mono border transition-all ${
              slowOnly
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-surface-2 text-muted border-border hover:text-slate-300"
            }`}
          >
            ⚡ slow only
          </button>
        </div>
      </div>

      {error && <ErrorPane message={error} />}

      {/* Endpoint performance table */}
      <Panel>
        <SectionHeader
          title="Endpoint Performance"
          sub="grouped by URL · sorted by call count"
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={endpointColumns}
            rows={data?.byEndpoint || []}
            keyField="url"
          />
        )}
      </Panel>

      {/* Raw calls */}
      <Panel>
        <SectionHeader
          title="Recent Calls"
          sub={`${data?.count || 0} total in range`}
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={rawColumns}
            rows={data?.calls || []}
            keyField="id"
          />
        )}
      </Panel>
    </div>
  );
}
