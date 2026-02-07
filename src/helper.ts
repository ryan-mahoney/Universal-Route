// src/helper.ts
// Route preparation & matching utility for Universal Route.
// Accepts either an array of route objects OR a map of { "/path": Component | [Component, reducerKey] }.
import type { ComponentType } from "react";

export interface RouteDefinition {
  path: string;
  Component?: ComponentType<any>;
  element?: ComponentType<any>;
  render?: ComponentType<any>;
  reducerKey?: string;
}

export type RouteMapValue =
  | ComponentType<any>
  | [ComponentType<any>]
  | [ComponentType<any>, string]
  | {
      Component?: ComponentType<any>;
      element?: ComponentType<any>;
      render?: ComponentType<any>;
      reducerKey?: string;
    };

export type RouteMap = Record<string, RouteMapValue>;

export type RoutesInput = RouteDefinition[] | RouteMap;

export interface PreparedRoute {
  path: string;
  Component: ComponentType<any>;
  reducerKey?: string;
  matcher: (pathname: string) => { params: Record<string, string> } | null;
}

export interface RouteMatchResult {
  Component: ComponentType<any>;
  params: Record<string, string>;
  reducerKey?: string;
}

type NormalizedRoute = {
  path: string;
  Component: ComponentType<any>;
  reducerKey?: string;
};

const isPreparedRouteArray = (
  routes: RoutesInput | PreparedRoute[],
): routes is PreparedRoute[] =>
  Array.isArray(routes) &&
  routes.every((route) => typeof route === "object" && typeof (route as PreparedRoute).matcher === "function");

const escapeRegex = (s: string): string => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
const decodeParam = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Compile a path pattern like "/users/:id" into a RegExp with named groups.
// Supports "*" or "/*" catch-all.
const compilePath = (path: string): { regex: RegExp; names: string[] } => {
  if (!path || path === "/") {
    return { regex: /^\/?$/, names: [] };
  }
  if (path === "*" || path === "/*") {
    return { regex: /^.*$/, names: [] };
  }

  const parts: Array<{ src: string; name: string | null }> = String(path)
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
  const names = parts.filter((p) => p.name).map((p) => p.name as string);
  return { regex: new RegExp(pattern), names };
};

// Graceful 404 Component that renders the text "404" (no React import required)
const Generic404 = (): string => "404";

// Normalize a single map entry: (path, value) -> { path, Component, reducerKey }
const normalizeMapEntry = (path: string, value: RouteMapValue): NormalizedRoute => {
  let Component: ComponentType<any>;
  let reducerKey: string | undefined;

  if (Array.isArray(value)) {
    [Component, reducerKey] = value;
  } else if (typeof value === "function") {
    Component = value;
  } else if (value && typeof value === "object") {
    Component = value.Component || value.element || value.render || (() => null);
    reducerKey = value.reducerKey;
  } else {
    Component = () => null;
  }

  return { path, Component, reducerKey };
};

// Normalize a route object from array form: { path, Component | element | render, reducerKey? }
const normalizeArrayEntry = (routeObj: RouteDefinition = { path: "/" }): NormalizedRoute => {
  const { path = "/", reducerKey } = routeObj;
  const Component = routeObj.Component || routeObj.element || routeObj.render || (() => null);
  return { path, Component, reducerKey };
};

// Convert routes (array or map) into a uniform list of { path, Component, reducerKey }
const toList = (routes: RoutesInput): NormalizedRoute[] => {
  if (Array.isArray(routes)) {
    return routes.map(normalizeArrayEntry);
  }

  return Object.entries(routes).map(([path, value]) => normalizeMapEntry(path, value));
};

// Public: prepare routes by attaching a matcher to each entry.
export const prepare = (routes: RoutesInput = []): PreparedRoute[] => {
  const list = toList(routes);

  return list.map((r) => {
    // Catch-all
    if (r.path === "*" || r.path === "/*") {
      return { ...r, matcher: () => ({ params: {} }) };
    }

    const { regex, names } = compilePath(r.path);
    const matcher = (pathname: string): { params: Record<string, string> } | null => {
      const m = regex.exec(pathname);
      if (!m) return null;

      const params = m.groups
        ? Object.fromEntries(
            Object.entries(m.groups).map(([k, v]) => [k, decodeParam(v as string)]),
          )
        : names.reduce<Record<string, string>>((acc, name, i) => {
            acc[name] = decodeParam(m[i + 1]);
            return acc;
          }, {});

      return { params };
    };

    return { ...r, matcher };
  });
};

// Internal: find a match in a prepared list
const matchOne = (preparedRoutes: PreparedRoute[], pathname: string): RouteMatchResult => {
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
export const match = (
  routes: RoutesInput | PreparedRoute[],
  pathname: string,
): RouteMatchResult => {
  const prepared = isPreparedRouteArray(routes) ? routes : prepare(routes);
  return matchOne(prepared, pathname);
};

export default { prepare, match };
