import { useMemo, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  Panel,
  SectionHeader,
  LoadingPane,
  ErrorPane,
  RatingBadge,
  DataTable,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import VitalsChart from "../components/charts/VitalsChart";
import { TimelineChart } from "../components/charts/TimelineChart";

const fmt = (n, d = 1) => (n == null ? "—" : Number(n).toFixed(d));

export default function Performance({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data, loading, error } = useFetch(
    () => api.performance({ appId: appId || undefined, from, to }),
    [appId, from, to],
    60000,
  );

  const vitalsTableColumns = [
    {
      key: "metric",
      label: "Metric",
      render: (v) => (
        <span className="mono text-xs font-semibold text-amber-400">{v}</span>
      ),
    },
    {
      key: "avg",
      label: "Avg",
      render: (v, row) => (
        <span className="mono text-xs text-slate-300">
          {row.metric === "CLS" ? fmt(v, 3) : `${fmt(v, 0)}ms`}
        </span>
      ),
    },
    {
      key: "p50",
      label: "p50",
      render: (v, row) => (
        <span className="mono text-xs text-slate-300">
          {row.metric === "CLS" ? fmt(v, 3) : `${fmt(v, 0)}ms`}
        </span>
      ),
    },
    {
      key: "p75",
      label: "p75",
      render: (v, row) => (
        <span className="mono text-xs text-amber-400">
          {row.metric === "CLS" ? fmt(v, 3) : `${fmt(v, 0)}ms`}
        </span>
      ),
    },
    {
      key: "p95",
      label: "p95",
      render: (v, row) => (
        <span className="mono text-xs text-rose-400">
          {row.metric === "CLS" ? fmt(v, 3) : `${fmt(v, 0)}ms`}
        </span>
      ),
    },
    {
      key: "samples",
      label: "Samples",
      render: (v) => <span className="mono text-xs text-muted">{v}</span>,
    },
    {
      key: "good",
      label: "Good",
      render: (v) => <span className="mono text-xs text-emerald-400">{v}</span>,
    },
    {
      key: "needs_improvement",
      label: "Needs Work",
      render: (v) => <span className="mono text-xs text-amber-400">{v}</span>,
    },
    {
      key: "poor",
      label: "Poor",
      render: (v) => <span className="mono text-xs text-rose-400">{v}</span>,
    },
  ];

  const byPageColumns = [
    {
      key: "page",
      label: "Page",
      render: (v) => (
        <span className="mono text-xs text-slate-300">{v || "—"}</span>
      ),
    },
    {
      key: "metric",
      label: "Metric",
      render: (v) => <span className="mono text-xs text-amber-400">{v}</span>,
    },
    {
      key: "avg_value",
      label: "Avg",
      render: (v, row) => (
        <span className="mono text-xs text-slate-300">
          {row.metric === "CLS" ? fmt(v, 3) : `${fmt(v, 0)}ms`}
        </span>
      ),
    },
    {
      key: "samples",
      label: "Samples",
      render: (v) => <span className="mono text-xs text-muted">{v}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">Performance</h1>
          <p className="text-xs mono text-muted mt-0.5">
            Core Web Vitals · load times · long tasks
          </p>
        </div>
        <FilterBar range={range} setRange={setRange} />
      </div>

      {error && <ErrorPane message={error} />}

      {/* Gauge cards */}
      <Panel>
        <SectionHeader
          title="Core Web Vitals"
          sub="averages for selected period"
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <VitalsChart
            vitals={(data?.vitals || [])
              .filter((v) => ["FCP", "LCP", "FID", "CLS"].includes(v.metric))
              .map((v) => ({ ...v, avg_value: v.avg, p75: v.p75 }))}
          />
        )}
      </Panel>

      {/* LCP Timeline */}
      <Panel>
        <SectionHeader
          title="LCP Over Time"
          sub="Largest Contentful Paint trend"
        />
        {data?.timeline?.length ? (
          <TimelineChart
            data={data.timeline}
            dataKey="avg_lcp"
            color="#fbbf24"
            unit="ms"
            height={200}
          />
        ) : (
          <LoadingPane />
        )}
      </Panel>

      {/* Stats table */}
      <Panel>
        <SectionHeader title="Detailed Metrics" sub="percentile breakdown" />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={vitalsTableColumns}
            rows={data?.vitals || []}
            keyField="metric"
          />
        )}
      </Panel>

      {/* By page */}
      <Panel>
        <SectionHeader
          title="Vitals by Page"
          sub="performance breakdown per route"
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <DataTable
            columns={byPageColumns}
            rows={data?.byPage || []}
            keyField="page"
          />
        )}
      </Panel>
    </div>
  );
}
