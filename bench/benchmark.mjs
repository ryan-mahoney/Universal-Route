// bench/benchmark.mjs
// Performance benchmark for Universal-Route
// Run: npm run bench

import { routesHelper } from "../dist/index.mjs";

// ── Configuration ─────────────────────────────────────────────
const ROUTE_COUNTS = [10, 100, 500, 1000];
const PREPARE_ITERATIONS = { 10: 10_000, 100: 5_000, 500: 1_000, 1000: 500 };
const MATCH_ITERATIONS = 100_000;
const WARMUP = 100;

// ── GC check ──────────────────────────────────────────────────
const gc = globalThis.gc || null;
if (!gc) {
  console.warn(
    "Warning: --expose-gc not set. Memory benchmarks will be approximate.\n",
  );
}

// ── Stub component (never rendered) ───────────────────────────
const Stub = () => null;

// ── Route generator ───────────────────────────────────────────
// Returns { routes, pathnames } where pathnames[i] matches routes[i].
function generateRoutes(count) {
  const prefixes = [
    "users",
    "posts",
    "comments",
    "products",
    "orders",
    "categories",
    "tags",
    "authors",
    "pages",
    "settings",
    "reviews",
    "invoices",
    "teams",
    "projects",
    "tasks",
    "messages",
    "notifications",
    "reports",
    "events",
    "files",
  ];

  const routes = {};
  const pathnames = [];

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length];
    const group = Math.floor(i / prefixes.length);
    const variant = i % 3;
    const suffix = group === 0 ? "" : `-g${group}`;

    let path, pathname;
    if (variant === 0) {
      path = `/${prefix}${suffix}`;
      pathname = path;
    } else if (variant === 1) {
      path = `/${prefix}${suffix}/list`;
      pathname = path;
    } else {
      path = `/${prefix}${suffix}/:id`;
      pathname = `/${prefix}${suffix}/42`;
    }

    routes[path] = Stub;
    pathnames.push(pathname);
  }

  return { routes, pathnames };
}

// ── Number formatting ─────────────────────────────────────────
function fmt(n, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ── Table renderer ────────────────────────────────────────────
function renderTable(title, columns, rows) {
  const widths = columns.map((col, i) =>
    Math.max(col.label.length + 2, ...rows.map((r) => String(r[i]).length + 2)),
  );

  const line = (left, mid, right, fill) =>
    left + widths.map((w) => fill.repeat(w)).join(mid) + right;

  console.log(`\n=== ${title} ===`);
  console.log(line("┌", "┬", "┐", "─"));
  console.log(
    "│" +
      columns
        .map((col, i) => {
          const s = col.label;
          return col.align === "right"
            ? s.padStart(widths[i] - 1) + " "
            : " " + s.padEnd(widths[i] - 1);
        })
        .join("│") +
      "│",
  );
  console.log(line("├", "┼", "┤", "─"));
  for (const row of rows) {
    console.log(
      "│" +
        row
          .map((val, i) => {
            const s = String(val);
            return columns[i].align === "right"
              ? s.padStart(widths[i] - 1) + " "
              : " " + s.padEnd(widths[i] - 1);
          })
          .join("│") +
        "│",
    );
  }
  console.log(line("└", "┴", "┘", "─"));
}

// ── Benchmark: prepare() ──────────────────────────────────────
function benchPrepare() {
  const rows = [];

  for (const count of ROUTE_COUNTS) {
    const { routes } = generateRoutes(count);
    const iterations = PREPARE_ITERATIONS[count];

    // warm-up
    for (let i = 0; i < WARMUP; i++) routesHelper.prepare(routes);

    const start = performance.now();
    let sink;
    for (let i = 0; i < iterations; i++) {
      sink = routesHelper.prepare(routes);
    }
    const elapsed = performance.now() - start;
    if (!sink) throw new Error("unreachable");

    rows.push([
      fmt(count, 0),
      fmt(iterations, 0),
      fmt(elapsed),
      fmt(elapsed / iterations, 4),
      fmt((elapsed / iterations / count) * 1000, 2),
    ]);
  }

  renderTable(
    "Route Compilation (prepare)",
    [
      { label: "Routes", align: "right" },
      { label: "Iterations", align: "right" },
      { label: "Total ms", align: "right" },
      { label: "Avg ms/call", align: "right" },
      { label: "Per-route (μs)", align: "right" },
    ],
    rows,
  );
}

// ── Benchmark: match() ────────────────────────────────────────
function benchMatch() {
  const rows = [];

  for (const count of ROUTE_COUNTS) {
    const { routes, pathnames } = generateRoutes(count);
    const prepared = routesHelper.prepare(routes);

    const bestPath = pathnames[0];
    const worstPath = pathnames[pathnames.length - 1];
    const missPath = "/this/path/does/not/exist/at/all";

    const scenarios = [
      ["best", bestPath],
      ["worst", worstPath],
      ["miss", missPath],
    ];

    const times = {};
    for (const [label, pathname] of scenarios) {
      // warm-up
      for (let i = 0; i < WARMUP; i++) routesHelper.match(prepared, pathname);

      let sink;
      const start = performance.now();
      for (let i = 0; i < MATCH_ITERATIONS; i++) {
        sink = routesHelper.match(prepared, pathname);
      }
      const elapsed = performance.now() - start;
      if (!sink) throw new Error("unreachable");

      times[label] = (elapsed / MATCH_ITERATIONS) * 1000; // microseconds
    }

    rows.push([
      fmt(count, 0),
      fmt(times.best, 3),
      fmt(times.worst, 3),
      fmt(times.miss, 3),
    ]);
  }

  renderTable(
    `Route Matching (match) — ${fmt(MATCH_ITERATIONS, 0)} iterations each`,
    [
      { label: "Routes", align: "right" },
      { label: "Best case (μs)", align: "right" },
      { label: "Worst case (μs)", align: "right" },
      { label: "404 miss (μs)", align: "right" },
    ],
    rows,
  );
}

// ── Benchmark: memory ─────────────────────────────────────────
function benchMemory() {
  const rows = [];

  for (const count of ROUTE_COUNTS) {
    const { routes } = generateRoutes(count);

    if (gc) gc();
    const before = process.memoryUsage().heapUsed;
    const prepared = routesHelper.prepare(routes);
    if (gc) gc();
    const after = process.memoryUsage().heapUsed;

    // keep reference alive
    void prepared.length;

    const deltaBytes = Math.max(0, after - before);
    rows.push([
      fmt(count, 0),
      fmt(deltaBytes / 1024, 2),
      fmt(Math.round(deltaBytes / count), 0),
    ]);
  }

  renderTable(
    "Memory Footprint",
    [
      { label: "Routes", align: "right" },
      { label: "Total KB", align: "right" },
      { label: "Per-route bytes", align: "right" },
    ],
    rows,
  );
}

// ── Main ──────────────────────────────────────────────────────
console.log("Universal-Route Performance Benchmark");
console.log(
  `Node ${process.version} | ${new Date().toISOString().slice(0, 10)}`,
);

benchPrepare();
benchMatch();
benchMemory();

console.log("");
