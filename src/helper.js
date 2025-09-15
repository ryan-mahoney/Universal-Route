// src/helper.js
// Route preparation & matching utility for Universal Route.
// Accepts either an array of route objects OR a map of { "/path": Component | [Component, reducerKey] }.

const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

// Compile a path pattern like "/users/:id" into a RegExp with named groups.
// Supports "*" or "/*" catch-all.
const compilePath = (path) => {
  if (!path || path === "/") {
    return { regex: /^\/?$/, names: [] };
  }
  if (path === "*" || path === "/*") {
    return { regex: /^.*$/, names: [] };
  }

  const parts = String(path)
    .split("/")
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith(":")) {
        const name = part.slice(1);
        return { src: `(?<${name}>[^/]+)`, name };
      }
      return { src: escapeRegex(part), name: null };
    });

  const pattern = "^/" + parts.map((p) => p.src).join("/") + "/?$";
  const names = parts.filter((p) => p.name).map((p) => p.name);
  return { regex: new RegExp(pattern), names };
};

// Graceful 404 Component that renders the text "404" (no React import required)
const Generic404 = () => "404";

// Normalize a single map entry: (path, value) -> { path, Component, reducerKey }
const normalizeMapEntry = (path, value) => {
  let Component, reducerKey;

  if (Array.isArray(value)) {
    [Component, reducerKey] = value;
  } else if (typeof value === "function") {
    Component = value;
  } else if (value && typeof value === "object") {
    // Allow object form { Component, element, render, reducerKey }
    Component =
      value.Component || value.element || value.render || (() => null);
    reducerKey = value.reducerKey;
  } else {
    Component = () => null;
  }

  return { path, Component, reducerKey };
};

// Normalize a route object from array form: { path, Component | element | render, reducerKey? }
const normalizeArrayEntry = (routeObj = {}) => {
  const { path = "/", reducerKey } = routeObj;
  const Component =
    routeObj.Component || routeObj.element || routeObj.render || (() => null);
  return { path, Component, reducerKey };
};

// Convert routes (array or map) into a uniform list of { path, Component, reducerKey }
const toList = (routes) => {
  if (Array.isArray(routes)) {
    return routes.map(normalizeArrayEntry);
  }
  if (routes && typeof routes === "object") {
    return Object.entries(routes).map(([path, value]) =>
      normalizeMapEntry(path, value)
    );
  }
  throw new TypeError(
    "routes must be an array of route objects or a map of { path: Component | [Component, reducerKey] }"
  );
};

// Public: prepare routes by attaching a matcher to each entry.
export const prepare = (routes = []) => {
  const list = toList(routes);

  return list.map((r) => {
    // Catch-all
    if (r.path === "*" || r.path === "/*") {
      return { ...r, matcher: () => ({ params: {} }) };
    }

    const { regex, names } = compilePath(r.path);
    const matcher = (pathname) => {
      const m = regex.exec(pathname);
      if (!m) return null;

      const params = m.groups
        ? Object.fromEntries(
            Object.entries(m.groups).map(([k, v]) => [k, decodeURIComponent(v)])
          )
        : names.reduce((acc, name, i) => {
            acc[name] = decodeURIComponent(m[i + 1]);
            return acc;
          }, {});

      return { params };
    };

    return { ...r, matcher };
  });
};

// Internal: find a match in a prepared list
const matchOne = (preparedRoutes, pathname) => {
  for (const r of preparedRoutes) {
    if (typeof r.matcher !== "function") continue;
    const res = r.matcher(pathname);
    if (res) {
      return {
        Component: r.Component,
        params: res.params || {},
        reducerKey: r.reducerKey,
      };
    }
  }

  // Catch-all fallback if provided
  const star = preparedRoutes.find((r) => r.path === "*" || r.path === "/*");
  if (star) {
    return {
      Component: star.Component,
      params: {},
      reducerKey: star.reducerKey,
    };
  }

  // Generic 404 fallback
  return { Component: Generic404, params: {} };
};

// Public: match() accepts either raw routes or an already-prepared list
export const match = (routesOrPrepared, pathname) => {
  const isPreparedArray =
    Array.isArray(routesOrPrepared) &&
    routesOrPrepared.every(
      (r) => typeof r === "object" && typeof r.matcher === "function"
    );

  const prepared = isPreparedArray
    ? routesOrPrepared
    : prepare(routesOrPrepared);
  return matchOne(prepared, pathname);
};

export default { prepare, match };
