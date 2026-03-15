/**
 * inject.js
 * Injects 200+ realistic events into the RUM ingest API.
 * Run with: node inject.js
 *
 * Simulates a busy 6-hour window of picker app activity:
 * - Page views across all routes
 * - API calls with realistic timings (some slow, some erroring)
 * - JS errors with real error messages
 * - Web vitals (FCP, LCP, FID, CLS)
 * - Multiple users across multiple sessions
 */

const ENDPOINT = "http://localhost:4000/ingest";

const USERS = [
  { id: "usr_inject_001", name: "Adarsh C",     role: "manager" },
  { id: "usr_inject_002", name: "Ravi Kumar",   role: "picker"  },
  { id: "usr_inject_003", name: "Priya S",      role: "picker"  },
  { id: "usr_inject_004", name: "Ankit M",      role: "picker"  },
  { id: "usr_inject_005", name: "Deepa R",      role: "picker"  },
];

const PAGES = [
  "/dashboard",
  "/orders",
  "/orders/:id",
  "/scan",
  "/profile",
  "/assignments",
];

const API_ENDPOINTS = [
  { url: "/api/orders",             method: "GET",   avgMs: 180,  errorRate: 0.02 },
  { url: "/api/orders/:id",         method: "GET",   avgMs: 120,  errorRate: 0.01 },
  { url: "/api/orders/:id/assign",  method: "POST",  avgMs: 340,  errorRate: 0.08 },
  { url: "/api/orders/:id/pick",    method: "PATCH", avgMs: 220,  errorRate: 0.05 },
  { url: "/api/scan/barcode",       method: "POST",  avgMs: 95,   errorRate: 0.12 },
  { url: "/api/products/:id",       method: "GET",   avgMs: 150,  errorRate: 0.02 },
  { url: "/api/auth/me",            method: "GET",   avgMs: 60,   errorRate: 0.00 },
  { url: "/api/assignments",        method: "GET",   avgMs: 210,  errorRate: 0.03 },
  { url: "/api/assignments/:id",    method: "PATCH", avgMs: 280,  errorRate: 0.06 },
];

const JS_ERRORS = [
  { message: "Cannot read properties of undefined (reading 'orderId')",  name: "TypeError"    },
  { message: "Cannot read properties of null (reading 'items')",         name: "TypeError"    },
  { message: "Network request failed — no internet connection",          name: "NetworkError" },
  { message: "Barcode scan timeout after 5000ms",                        name: "ScanError"    },
  { message: "Order assignment conflict: already assigned to picker",    name: "Error"        },
  { message: "Failed to fetch: ERR_CONNECTION_RESET",                    name: "TypeError"    },
  { message: "Unexpected token in JSON at position 0",                   name: "SyntaxError"  },
  { message: "Maximum update depth exceeded in OrderList",               name: "Error"        },
];

const VITALS = {
  FCP:  { good: 1800, poor: 3000 },
  LCP:  { good: 2500, poor: 4000 },
  FID:  { good: 100,  poor: 300  },
  CLS:  { good: 0.1,  poor: 0.25 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function tsAgo(msAgo) {
  return new Date(Date.now() - msAgo).toISOString();
}
function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function jitter(base, pct = 0.4) {
  return Math.round(base * (1 + (Math.random() - 0.5) * pct));
}
function rateMetric(metric, value) {
  const { good, poor } = VITALS[metric];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

// ─── Event Generators ─────────────────────────────────────────────────────────

function makePageView(session, msAgo) {
  const page = pick(PAGES);
  return {
    type: "page_view",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      page,
      title: page.replace(/\//g, " ").trim() || "Home",
      referrer: null,
    },
  };
}

function makeApiCall(session, msAgo) {
  const ep = pick(API_ENDPOINTS);
  const isError = Math.random() < ep.errorRate;
  const isSlow  = Math.random() < 0.15;
  const duration = isSlow
    ? jitter(ep.avgMs * 6, 0.5)
    : jitter(ep.avgMs, 0.4);
  const status = isError
    ? pick([400, 404, 422, 500, 503])
    : pick([200, 200, 200, 201]);

  return {
    type: "api_call",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      url: ep.url,
      method: ep.method,
      status,
      ok: status < 400,
      duration,
      slow: duration > 1000,
      page: pick(PAGES),
      requestSize: randInt(100, 2000),
      responseSize: randInt(500, 50000),
    },
  };
}

function makeError(session, msAgo) {
  const err = pick(JS_ERRORS);
  return {
    type: "js_error",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      ...err,
      source: pick(["window.onerror", "unhandledrejection", "console.error"]),
      stack: `${err.name}: ${err.message}\n    at handleOrder (OrderList.jsx:142)\n    at processTicksAndRejections (node:internal/process/task_queues:95)`,
      page: pick(PAGES),
      file: pick(["OrderList.jsx", "Scanner.jsx", "Assignment.jsx", "api/orders.js"]),
      line: randInt(40, 200),
      col: randInt(5, 60),
    },
  };
}

function makeVital(session, metric, msAgo) {
  const ranges = {
    FCP: [800,  3500],
    LCP: [1200, 5000],
    FID: [10,   350],
    CLS: [0.01, 0.30],
  };
  const [min, max] = ranges[metric];
  const value = parseFloat(rand(min, max).toFixed(metric === "CLS" ? 3 : 0));

  return {
    type: "performance",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      metric,
      value,
      rating: rateMetric(metric, value),
      page: pick(PAGES),
    },
  };
}

function makePageLoad(session, msAgo) {
  return {
    type: "performance",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      metric: "page_load",
      ttfb: randInt(50, 400),
      domLoad: randInt(300, 2000),
      windowLoad: randInt(500, 3500),
      domInteractive: randInt(200, 1500),
      page: pick(PAGES),
    },
  };
}

function makeClick(session, msAgo) {
  const labels = [
    "Confirm Order", "Scan Item", "Assign Picker",
    "Mark Picked", "View Details", "Reassign",
    "Complete", "Cancel Order", "Start Picking",
  ];
  return {
    type: "interaction",
    appId: session.appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: session.user.id,
    timestamp: tsAgo(msAgo),
    sessionAge: session.ageMs,
    data: {
      action: "click",
      tag: "button",
      label: pick(labels),
      page: pick(PAGES),
      x: randInt(100, 1200),
      y: randInt(100, 800),
    },
  };
}

// ─── Session Builder ──────────────────────────────────────────────────────────

function buildSession(index) {
  const user   = pick(USERS);
  const appId  = index % 3 === 0 ? "manager-dashboard" : "picker-app";
  const startMsAgo = randInt(30 * 60 * 1000, 6 * 60 * 60 * 1000); // within last 6h

  const session = {
    id: generateId("ses_inj"),
    appId,
    user,
    deviceId: generateId("dev_inj"),
    ageMs: startMsAgo,
    startMsAgo,
  };

  const events = [];
  let cursor = startMsAgo;

  // Identify event
  events.push({
    type: "identify",
    appId,
    sessionId: session.id,
    deviceId: session.deviceId,
    userId: user.id,
    timestamp: tsAgo(cursor),
    sessionAge: 0,
    data: { userId: user.id, name: user.name, role: user.role },
  });

  cursor -= randInt(1000, 5000);

  // Page load vitals
  events.push(makePageLoad(session, cursor));
  Object.keys(VITALS).forEach((metric) => {
    cursor -= randInt(500, 2000);
    events.push(makeVital(session, metric, cursor));
  });

  // Mix of page views, api calls, clicks, occasional errors
  const numEvents = randInt(15, 35);
  for (let i = 0; i < numEvents; i++) {
    cursor -= randInt(2000, 30000);
    const roll = Math.random();

    if (roll < 0.25)      events.push(makePageView(session, cursor));
    else if (roll < 0.65) events.push(makeApiCall(session, cursor));
    else if (roll < 0.82) events.push(makeClick(session, cursor));
    else if (roll < 0.92) events.push(makeError(session, cursor));
    else {
      // Another vital sample
      const metric = pick(Object.keys(VITALS));
      events.push(makeVital(session, metric, cursor));
    }
  }

  return events;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function sendBatch(events) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });
  return res.json();
}

async function main() {
  console.log("🚀 Injecting realistic session data...\n");

  const NUM_SESSIONS = 15;
  let totalEvents = 0;
  let totalProcessed = 0;

  for (let i = 0; i < NUM_SESSIONS; i++) {
    const events = buildSession(i);
    const result = await sendBatch(events);
    totalEvents += events.length;
    totalProcessed += result.processed || 0;
    process.stdout.write(`  Session ${(i + 1).toString().padStart(2, "0")}/${NUM_SESSIONS} → ${events.length} events → processed: ${result.processed}\n`);

    // Small delay to avoid hammering the API
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n✅ Done! Sent ${totalEvents} events, ${totalProcessed} processed.`);
  console.log("👉 Refresh your dashboard at http://localhost:3000\n");
}

main().catch(console.error);
