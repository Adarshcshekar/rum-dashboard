import { useFetch } from "../hooks/useFetch";
import { api } from "../api";
import {
  StatCard,
  Panel,
  SectionHeader,
  LoadingPane,
  ErrorPane,
  Badge,
} from "../components/UI";
import FilterBar, { getDateRange } from "../components/FilterBar";
import VitalsChart from "../components/charts/VitalsChart";
import { TimelineChart } from "../components/charts/TimelineChart";
import { useMemo, useState } from "react";

const fmt = (n, decimals = 0) =>
  n == null
    ? "—"
    : Number(n)
        .toFixed(decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const ms = (n) => (n == null ? "—" : `${fmt(n)}ms`);

export default function Overview({ appId }) {
  const [range, setRange] = useState(24 * 60 * 60 * 1000);
  const { from, to } = useMemo(() => getDateRange(range), [range]);

  const { data, loading, error } = useFetch(
    () => api.overview({ appId: appId || undefined, from, to }),
    [appId, from, to],
    30000, // refresh every 30s
  );

  const { data: perfData } = useFetch(
    () => api.performance({ appId: appId || undefined, from, to }),
    [appId, from, to],
    60000,
  );

  const { data: pageData } = useFetch(
    () => api.pageViews({ appId: appId || undefined, from, to, limit: 8 }),
    [appId, from, to],
    60000,
  );

  const errorRate = data
    ? ((data.apiCalls?.error_count / data.apiCalls?.total) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">Overview</h1>
          <p className="text-xs mono text-muted mt-0.5">
            {appId || "all apps"} · real-time observability
          </p>
        </div>
        <FilterBar range={range} setRange={setRange} />
      </div>

      {error && <ErrorPane message={error} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Sessions"
          value={fmt(data?.sessions?.total)}
          sub={`${fmt(data?.sessions?.unique_users)} unique users`}
          accent="amber"
          icon="◉"
        />
        <StatCard
          label="JS Errors"
          value={fmt(data?.errors?.total)}
          sub={`${fmt(data?.errors?.affected_sessions)} sessions affected`}
          accent="rose"
          icon="⚠"
        />
        <StatCard
          label="API Calls"
          value={fmt(data?.apiCalls?.total)}
          sub={`avg ${ms(data?.apiCalls?.avg_duration)}`}
          accent="sky"
          icon="⇄"
        />
        <StatCard
          label="Error Rate"
          value={errorRate != null ? `${errorRate}%` : "—"}
          sub={`${fmt(data?.apiCalls?.slow_count)} slow calls`}
          accent={parseFloat(errorRate) > 5 ? "rose" : "emerald"}
          icon="◎"
        />
      </div>

      {/* Web Vitals */}
      <Panel>
        <SectionHeader
          title="Core Web Vitals"
          sub="Google thresholds: Good / Needs Improvement / Poor"
        />
        {loading ? (
          <LoadingPane />
        ) : (
          <VitalsChart vitals={data?.vitals || []} />
        )}
      </Panel>

      {/* LCP Timeline + Top Pages side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionHeader
            title="LCP Trend"
            sub="Largest Contentful Paint over time"
          />
          {perfData?.timeline?.length ? (
            <TimelineChart
              data={perfData.timeline}
              dataKey="avg_lcp"
              color="#fbbf24"
              unit="ms"
              height={180}
            />
          ) : (
            <LoadingPane />
          )}
        </Panel>

        <Panel>
          <SectionHeader title="Top Pages" sub="by visit count" />
          {pageData?.pages?.length ? (
            <div className="space-y-2">
              {pageData.pages.map((p) => (
                <div key={p.page} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mono text-xs text-slate-300 truncate">
                      {p.page}
                    </div>
                    <div className="mt-1 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500/60 rounded-full"
                        style={{
                          width: `${Math.min(100, (p.views / pageData.pages[0]?.views) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mono text-xs text-amber-400">{p.views}</div>
                    <div className="mono text-xs text-muted">
                      {p.unique_sessions} sessions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <LoadingPane />
          )}
        </Panel>
      </div>

      {/* API Health */}
      <Panel>
        <SectionHeader
          title="API Health Snapshot"
          sub="calls grouped by endpoint"
        />
        {loading ? (
          <LoadingPane />
        ) : (
          data && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-3 rounded-lg p-4 text-center">
                <div className="mono text-2xl font-semibold text-emerald-400">
                  {Number(data.apiCalls?.total) -
                    Number(data.apiCalls?.error_count) || 0}
                </div>
                <div className="mono text-xs text-muted mt-1">successful</div>
              </div>
              <div className="bg-surface-3 rounded-lg p-4 text-center">
                <div className="mono text-2xl font-semibold text-rose-400">
                  {fmt(data.apiCalls?.error_count)}
                </div>
                <div className="mono text-xs text-muted mt-1">failed</div>
              </div>
              <div className="bg-surface-3 rounded-lg p-4 text-center">
                <div className="mono text-2xl font-semibold text-amber-400">
                  {fmt(data.apiCalls?.slow_count)}
                </div>
                <div className="mono text-xs text-muted mt-1">
                  slow (&gt;1s)
                </div>
              </div>
            </div>
          )
        )}
      </Panel>
    </div>
  );
}
