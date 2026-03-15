import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  Panel,
  SectionHeader,
  DataTable,
  LoadingPane,
  ErrorPane,
  Badge,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import { format, formatDistanceToNow } from "date-fns";

function durationLabel(ms) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export default function Sessions({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const [selected, setSelected] = useState(null);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data, loading, error } = useFetch(
    () => api.sessions({ appId: appId || undefined, from, to, limit: 100 }),
    [appId, from, to],
    30000,
  );

  const columns = [
    {
      key: "started_at",
      label: "Started",
      render: (v) => (
        <span className="mono text-xs text-muted">
          {v ? formatDistanceToNow(new Date(v), { addSuffix: true }) : "—"}
        </span>
      ),
    },
    {
      key: "user_id",
      label: "User",
      render: (v, row) => {
        const raw = row.user_meta;
        const meta =
          typeof raw === "string" ? JSON.parse(raw || "{}") : raw || {};
        return (
          <div>
            <div className="mono text-xs text-sky-400">
              {meta.name || v || "anonymous"}
            </div>
            {meta.role && (
              <div className="mono text-xs text-muted">{meta.role}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "app_id",
      label: "App",
      render: (v) => <Badge variant="info">{v}</Badge>,
    },
    {
      key: "duration_ms",
      label: "Duration",
      render: (v) => (
        <span className="mono text-xs text-slate-300">{durationLabel(v)}</span>
      ),
    },
    {
      key: "page_views",
      label: "Pages",
      render: (v) => <span className="mono text-xs text-amber-400">{v}</span>,
    },
    {
      key: "api_call_count",
      label: "API calls",
      render: (v) => <span className="mono text-xs text-sky-400">{v}</span>,
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
      key: "entry_page",
      label: "Entry",
      render: (v) => (
        <span className="mono text-xs text-muted">{v || "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">Sessions</h1>
          <p className="text-xs mono text-muted mt-0.5">
            user sessions with activity summary
          </p>
        </div>
        <FilterBar range={range} setRange={setRange} />
      </div>

      {error && <ErrorPane message={error} />}

      {/* Session detail */}
      {selected && (
        <Panel className="border-sky-500/30 bg-sky-500/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mono">
                {selected.id}
              </h3>
              <div className="text-xs text-muted mono mt-0.5">
                {selected.started_at
                  ? format(
                      new Date(selected.started_at),
                      "MMM d yyyy, HH:mm:ss",
                    )
                  : "—"}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted hover:text-slate-300 mono text-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Duration",
                value: durationLabel(selected.duration_ms),
                color: "text-amber-400",
              },
              {
                label: "Page views",
                value: selected.page_views,
                color: "text-sky-400",
              },
              {
                label: "API calls",
                value: selected.api_call_count,
                color: "text-emerald-400",
              },
              {
                label: "Errors",
                value: selected.error_count,
                color:
                  selected.error_count > 0 ? "text-rose-400" : "text-muted",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface-3 rounded-lg p-3">
                <div className="mono text-xs text-muted">{label}</div>
                <div className={`mono text-xl font-semibold mt-1 ${color}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          {selected.entry_page && (
            <div className="mt-3 flex gap-4 text-xs mono text-muted">
              <span>
                entry:{" "}
                <span className="text-slate-300">{selected.entry_page}</span>
              </span>
              {selected.exit_page && (
                <span>
                  exit:{" "}
                  <span className="text-slate-300">{selected.exit_page}</span>
                </span>
              )}
            </div>
          )}
        </Panel>
      )}

      {/* Sessions table */}
      <Panel>
        <SectionHeader
          title="All Sessions"
          sub={`${data?.count || 0} sessions · click to expand`}
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={columns}
            rows={data?.sessions || []}
            keyField="id"
            onRow={setSelected}
          />
        )}
      </Panel>
    </div>
  );
}
