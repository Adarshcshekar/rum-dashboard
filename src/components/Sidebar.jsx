import { NavLink } from "react-router-dom";
import clsx from "clsx";

const NAV = [
  { to: "/", icon: "◈", label: "Overview" },
  { to: "/errors", icon: "⚠", label: "Errors" },
  { to: "/api-calls", icon: "⇄", label: "API Calls" },
  { to: "/performance", icon: "◎", label: "Performance" },
  { to: "/sessions", icon: "◉", label: "Sessions" },
  { to: "/interactions", icon: "⊕", label: "Interactions" },
];

export default function Sidebar({ appId, setAppId }) {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-1 border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs mono font-bold">R</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200 leading-none">
              RUM
            </div>
            <div className="text-xs text-muted mono leading-none mt-0.5">
              picker-dashboard
            </div>
          </div>
        </div>
      </div>

      {/* App selector */}
      <div className="px-4 py-3 border-b border-border">
        <label className="text-xs mono text-muted uppercase tracking-wider block mb-1.5">
          App
        </label>
        <select
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="w-full bg-surface-3 border border-border text-slate-300 text-xs mono rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All apps</option>
          <option value="picker-dashboard">picker-dashboard</option>
        </select>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150",
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-muted hover:text-slate-300 hover:bg-surface-3",
              )
            }
          >
            <span className="mono text-base leading-none">{icon}</span>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Live indicator */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="status-dot bg-emerald-400" />
          <span className="text-xs mono text-muted">live · 30s refresh</span>
        </div>
      </div>
    </aside>
  );
}
