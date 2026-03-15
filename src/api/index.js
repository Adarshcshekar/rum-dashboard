/**
 * api/index.js
 * Typed fetch wrappers for the RUM backend.
 * All requests go through /api which Vite proxies to localhost:4000
 */

const BASE = "/api";

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  overview:    (p) => get("/events/overview",    p),
  sessions:    (p) => get("/events/sessions",    p),
  errors:      (p) => get("/events/errors",      p),
  apiCalls:    (p) => get("/events/api-calls",   p),
  performance: (p) => get("/events/performance", p),
  pageViews:   (p) => get("/events/page-views",  p),
  health:      ()  => get("/health"),
};
