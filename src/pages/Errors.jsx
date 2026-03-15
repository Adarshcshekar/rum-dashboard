import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  Panel,
  SectionHeader,
  DataTable,
  Badge,
  LoadingPane,
  ErrorPane,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import { format } from "date-fns";

export default function Errors({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const [selected, setSelected] = useState(null);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data, loading, error } = useFetch(
    () => api.errors({ appId: appId || undefined, from, to, limit: 100 }),
    [appId, from, to],
    30000,
  );

  const errorColumns = [
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
      key: "name",
      label: "Type",
      render: (v) => (
        <span className="mono text-xs text-rose-400">{v || "Error"}</span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (v) => (
        <span
          className="mono text-xs text-slate-300 truncate max-w-xs block cursor-help"
          title={v}
        >
          {v}
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
      key: "source",
      label: "Source",
      render: (v) => <Badge variant="default">{v || "unknown"}</Badge>,
    },
    {
      key: "user_id",
      label: "User",
      render: (v) => (
        <span className="mono text-xs text-sky-400">{v || "anon"}</span>
      ),
    },
    {
      key: "context",
      label: "API URL",
      render: (v) => {
        const ctx = typeof v === "string" ? JSON.parse(v || "{}") : v || {};
        return (
          <span
            className="mono text-xs text-sky-400 truncate max-w-xs block cursor-help"
            title={ctx?.url || "—"}
          >
            {ctx?.url || "—"}
          </span>
        );
      },
    },
  ];

  const groupedColumns = [
    {
      key: "name",
      label: "Type",
      render: (v) => (
        <span className="mono text-xs text-rose-400">{v || "Error"}</span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (v) => (
        <span className="mono text-xs text-slate-300 cursor-help" title={v}>
          {v}
        </span>
      ),
    },
    {
      key: "occurrences",
      label: "Count",
      render: (v) => (
        <span className="mono text-sm font-semibold text-rose-400">{v}</span>
      ),
    },
    {
      key: "affected_sessions",
      label: "Sessions",
      render: (v) => <span className="mono text-xs text-amber-400">{v}</span>,
    },
    {
      key: "last_seen",
      label: "Last seen",
      render: (v) => (
        <span className="mono text-xs text-muted">
          {v ? format(new Date(v), "MMM d, HH:mm") : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">JS Errors</h1>
          <p className="text-xs mono text-muted mt-0.5">
            exceptions, rejections, crashes
          </p>
        </div>
        <FilterBar range={range} setRange={setRange} />
      </div>

      {error && <ErrorPane message={error} />}

      {/* Grouped errors */}
      <Panel>
        <SectionHeader title="Most Frequent Errors" sub="grouped by message" />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={groupedColumns}
            rows={data?.grouped || []}
            keyField="message"
            onRow={(row) => setSelected(row)}
          />
        )}
      </Panel>

      {/* Detail drawer */}
      {selected && (
        <Panel className="border-rose-500/30 bg-rose-500/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="mono text-xs text-rose-400">
                {selected.name}
              </span>
              <h3 className="text-sm font-medium text-slate-200 mt-0.5">
                {selected.message}
              </h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted hover:text-slate-300 mono text-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-surface-3 rounded p-3">
              <div className="mono text-xs text-muted">Occurrences</div>
              <div className="mono text-lg font-semibold text-rose-400">
                {selected.occurrences}
              </div>
            </div>
            <div className="bg-surface-3 rounded p-3">
              <div className="mono text-xs text-muted">Sessions affected</div>
              <div className="mono text-lg font-semibold text-amber-400">
                {selected.affected_sessions}
              </div>
            </div>
            <div className="bg-surface-3 rounded p-3">
              <div className="mono text-xs text-muted">Last seen</div>
              <div className="mono text-sm text-slate-300">
                {selected.last_seen
                  ? format(new Date(selected.last_seen), "MMM d, HH:mm")
                  : "—"}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Raw error feed */}
      <Panel>
        <SectionHeader
          title="Error Feed"
          sub={`${data?.count || 0} errors · click row for details`}
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={errorColumns}
            rows={data?.errors || []}
            keyField="id"
          />
        )}
      </Panel>
    </div>
  );
}
