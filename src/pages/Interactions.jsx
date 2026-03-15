import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  Panel,
  SectionHeader,
  DataTable,
  LoadingPane,
  ErrorPane,
  EmptyPane,
  Badge,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import { format } from "date-fns";

export default function Interactions({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const {
    data: eventsData,
    loading,
    error,
  } = useFetch(
    () =>
      api.events({
        appId: appId || undefined,
        from,
        to,
        type: "interaction",
        limit: 500,
      }),
    [appId, from, to],
    30000,
  );

  // Aggregate clicks by label
  const topButtons = useMemo(() => {
    if (!eventsData?.events) return [];
    const map = {};
    for (const e of eventsData.events) {
      const label = e.data?.label || e.data?.rumId || e.data?.tag || "unknown";
      const page = e.data?.page || "/";
      const key = `${label}||${page}`;
      if (!map[key]) map[key] = { label, page, count: 0, rumId: e.data?.rumId };
      map[key].count++;
    }
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [eventsData]);

  // Aggregate clicks by page
  const clicksByPage = useMemo(() => {
    if (!eventsData?.events) return [];
    const map = {};
    for (const e of eventsData.events) {
      const page = e.data?.page || "/";
      if (!map[page]) map[page] = { page, clicks: 0 };
      map[page].clicks++;
    }
    return Object.values(map).sort((a, b) => b.clicks - a.clicks);
  }, [eventsData]);

  // Raw interactions feed
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
      key: "data",
      label: "Element",
      render: (v) => (
        <div>
          <div className="mono text-xs text-slate-300">
            {v?.label || v?.tag || "—"}
          </div>
          {v?.rumId && (
            <div className="mono text-xs text-amber-400">{v.rumId}</div>
          )}
        </div>
      ),
    },
    {
      key: "data",
      label: "Selector",
      render: (v) => (
        <span
          className="mono text-xs text-muted truncate max-w-xs block cursor-help"
          title={v?.selector}
        >
          {v?.selector || "—"}
        </span>
      ),
    },
    {
      key: "data",
      label: "Page",
      render: (v) => (
        <span className="mono text-xs text-sky-400">{v?.page || "—"}</span>
      ),
    },
    {
      key: "user_id",
      label: "User",
      render: (v) => (
        <span className="mono text-xs text-sky-400">{v || "anon"}</span>
      ),
    },
    {
      key: "session_id",
      label: "Session",
      render: (v) => (
        <span className="mono text-xs text-muted truncate max-w-[80px] block">
          {v || "—"}
        </span>
      ),
    },
  ];

  const topButtonColumns = [
    {
      key: "label",
      label: "Button / Element",
      render: (v, row) => (
        <div>
          <div className="mono text-xs text-slate-300">{v}</div>
          {row.rumId && (
            <div className="mono text-xs text-amber-400 mt-0.5">
              #{row.rumId}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "page",
      label: "Page",
      render: (v) => <span className="mono text-xs text-sky-400">{v}</span>,
    },
    {
      key: "count",
      label: "Clicks",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <span className="mono text-sm font-semibold text-amber-400">{v}</span>
          <div className="flex-1 h-1.5 bg-surface-4 rounded-full overflow-hidden w-24">
            <div
              className="h-full bg-amber-500/60 rounded-full"
              style={{
                width: `${Math.min(100, (v / (topButtons[0]?.count || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  const pageClickColumns = [
    {
      key: "page",
      label: "Page",
      render: (v) => <span className="mono text-xs text-slate-300">{v}</span>,
    },
    {
      key: "clicks",
      label: "Total Clicks",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <span className="mono text-sm font-semibold text-sky-400">{v}</span>
          <div className="flex-1 h-1.5 bg-surface-4 rounded-full overflow-hidden w-24">
            <div
              className="h-full bg-sky-500/60 rounded-full"
              style={{
                width: `${Math.min(100, (v / (clicksByPage[0]?.clicks || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  const totalClicks = eventsData?.events?.length || 0;
  const uniqueButtons = topButtons.length;
  const uniquePages = clicksByPage.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">Interactions</h1>
          <p className="text-xs mono text-muted mt-0.5">
            button clicks · user interactions · navigation
          </p>
        </div>
        <FilterBar range={range} setRange={setRange} />
      </div>

      {error && <ErrorPane message={error} />}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-2 border border-amber-500/30 bg-amber-500/5 rounded-lg p-5">
          <div className="text-xs mono text-muted uppercase tracking-widest mb-2">
            Total Clicks
          </div>
          <div className="text-3xl font-semibold mono text-amber-400">
            {totalClicks}
          </div>
        </div>
        <div className="bg-surface-2 border border-sky-500/30 bg-sky-500/5 rounded-lg p-5">
          <div className="text-xs mono text-muted uppercase tracking-widest mb-2">
            Unique Elements
          </div>
          <div className="text-3xl font-semibold mono text-sky-400">
            {uniqueButtons}
          </div>
        </div>
        <div className="bg-surface-2 border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-5">
          <div className="text-xs mono text-muted uppercase tracking-widest mb-2">
            Pages with Clicks
          </div>
          <div className="text-3xl font-semibold mono text-emerald-400">
            {uniquePages}
          </div>
        </div>
      </div>

      {/* Top buttons + clicks by page side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionHeader
            title="Most Clicked Elements"
            sub="top 20 buttons and interactive elements"
          />
          {loading ? (
            <LoadingPane />
          ) : topButtons.length === 0 ? (
            <EmptyPane message="No interactions yet" />
          ) : (
            <DataTable
              columns={topButtonColumns}
              rows={topButtons}
              keyField="label"
            />
          )}
        </Panel>

        <Panel>
          <SectionHeader
            title="Clicks by Page"
            sub="which pages get the most interaction"
          />
          {loading ? (
            <LoadingPane />
          ) : clicksByPage.length === 0 ? (
            <EmptyPane message="No interactions yet" />
          ) : (
            <DataTable
              columns={pageClickColumns}
              rows={clicksByPage}
              keyField="page"
            />
          )}
        </Panel>
      </div>

      {/* Raw interactions feed */}
      <Panel>
        <SectionHeader
          title="Interaction Feed"
          sub={`${totalClicks} interactions · most recent first`}
        />
        {loading ? (
          <LoadingPane />
        ) : eventsData?.events?.length === 0 ? (
          <EmptyPane message="No interactions in this time range" />
        ) : (
          <DataTable
            columns={rawColumns}
            rows={eventsData?.events || []}
            keyField="id"
          />
        )}
      </Panel>
    </div>
  );
}
