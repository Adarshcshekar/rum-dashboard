const BASE = `${import.meta.env.VITE_API_URL}/events`;

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)),
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  overview: (p) => get("/overview", p),
  sessions: (p) => get("/sessions", p),
  errors: (p) => get("/errors", p),
  apiCalls: (p) => get("/api-calls", p),
  performance: (p) => get("/performance", p),
  pageViews: (p) => get("/page-views", p),
  events: (p) => get("", p),
  health: () =>
    fetch(`${import.meta.env.VITE_API_URL}/health`).then((r) => r.json()),
};
