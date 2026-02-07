"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Link: () => Link,
  appHistory: () => appHistory,
  createRouter: () => createRouter,
  makeMemoryHistory: () => makeMemoryHistory,
  navigate: () => navigate,
  routesHelper: () => helper_default
});
module.exports = __toCommonJS(index_exports);

// src/router.tsx
var import_react = require("react");

// src/history.ts
var import_history = require("history");
var appHistory = typeof window !== "undefined" && window.document && typeof window.document.createElement === "function" ? (0, import_history.createBrowserHistory)() : null;
var makeMemoryHistory = (initialEntries = ["/"]) => (0, import_history.createMemoryHistory)({ initialEntries });
var history_default = appHistory;

// src/helper.ts
var isPreparedRouteArray = (routes) => Array.isArray(routes) && routes.every((route) => typeof route === "object" && typeof route.matcher === "function");
var escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
var compilePath = (path) => {
  if (!path || path === "/") {
    return { regex: /^\/?$/, names: [] };
  }
  if (path === "*" || path === "/*") {
    return { regex: /^.*$/, names: [] };
  }
  const parts = String(path).split("/").filter(Boolean).map((part) => {
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
var Generic404 = () => "404";
var normalizeMapEntry = (path, value) => {
  let Component;
  let reducerKey;
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
var normalizeArrayEntry = (routeObj = { path: "/" }) => {
  const { path = "/", reducerKey } = routeObj;
  const Component = routeObj.Component || routeObj.element || routeObj.render || (() => null);
  return { path, Component, reducerKey };
};
var toList = (routes) => {
  if (Array.isArray(routes)) {
    return routes.map(normalizeArrayEntry);
  }
  return Object.entries(routes).map(([path, value]) => normalizeMapEntry(path, value));
};
var prepare = (routes = []) => {
  const list = toList(routes);
  return list.map((r) => {
    if (r.path === "*" || r.path === "/*") {
      return { ...r, matcher: () => ({ params: {} }) };
    }
    const { regex, names } = compilePath(r.path);
    const matcher = (pathname) => {
      const m = regex.exec(pathname);
      if (!m) return null;
      const params = m.groups ? Object.fromEntries(
        Object.entries(m.groups).map(([k, v]) => [k, decodeURIComponent(v)])
      ) : names.reduce((acc, name, i) => {
        acc[name] = decodeURIComponent(m[i + 1]);
        return acc;
      }, {});
      return { params };
    };
    return { ...r, matcher };
  });
};
var matchOne = (preparedRoutes, pathname) => {
  for (const r of preparedRoutes) {
    if (typeof r.matcher !== "function") continue;
    const res = r.matcher(pathname);
    if (res) {
      return {
        Component: r.Component,
        params: res.params || {},
        reducerKey: r.reducerKey
      };
    }
  }
  const star = preparedRoutes.find((r) => r.path === "*" || r.path === "/*");
  if (star) {
    return {
      Component: star.Component,
      params: {},
      reducerKey: star.reducerKey
    };
  }
  return { Component: Generic404, params: {} };
};
var match = (routes, pathname) => {
  const prepared = isPreparedRouteArray(routes) ? routes : prepare(routes);
  return matchOne(prepared, pathname);
};
var helper_default = { prepare, match };

// src/router.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var appHistory2 = history_default;
var navigate = (to, options = {}) => {
  const { replace = false, state } = options;
  if (replace) appHistory2.replace(to, state);
  else appHistory2.push(to, state);
};
var toHref = (to) => {
  if (typeof to === "string") return to;
  const { pathname, search = "", hash = "" } = to;
  if (typeof pathname !== "string" || pathname.length === 0) {
    throw new TypeError("Location object 'pathname' must be a non-empty string");
  }
  return `${pathname}${search}${hash}`;
};
var isHttpLikeHref = (href) => {
  if (href.startsWith("//")) return false;
  if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../") || href.startsWith("?") || href.startsWith("#")) {
    return true;
  }
  const protocolMatch = href.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
  if (!protocolMatch) return true;
  const protocol = protocolMatch[1].toLowerCase();
  if (protocol !== "http" && protocol !== "https") return false;
  if (typeof window === "undefined" || !window.location) return false;
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};
var toClientPath = (to, href) => {
  if (typeof to !== "string") return to;
  if (!/^https?:/i.test(href)) return to;
  try {
    const url = new URL(href, window.location.href);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return to;
  }
};
var shouldHandleClientNavigation = (event, anchorProps) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
    return false;
  }
  const { target, download, href } = anchorProps;
  if (download !== void 0) return false;
  if (target && target !== "_self") return false;
  return isHttpLikeHref(href);
};
var Link = ({
  to,
  replace = false,
  state,
  onClick,
  ...rest
}) => {
  const href = toHref(to);
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!shouldHandleClientNavigation(e, { ...rest, href })) return;
    e.preventDefault();
    const nextTo = toClientPath(to, href);
    if (replace) appHistory2.replace(nextTo, state);
    else appHistory2.push(nextTo, state);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, onClick: handleClick, ...rest });
};
var matchRoute = (routes, pathname) => helper_default.match(routes, pathname);
var createRouter = (routes, storeContext) => {
  const Router = (props) => {
    const appState = storeContext && (0, import_react.useContext)(storeContext) || { state: props, dispatch: false };
    const { pageRefresher } = appState;
    const { state, dispatch } = appState;
    const preparedRoutes = (0, import_react.useMemo)(() => helper_default.prepare(routes), [routes]);
    const currentFromHistory = (history_default?.location?.pathname || "") + (history_default?.location?.search || "");
    const initialLocation = state && state.location || currentFromHistory;
    const lastLocRef = (0, import_react.useRef)(initialLocation);
    const [loc, setLoc] = (0, import_react.useState)(initialLocation);
    (0, import_react.useEffect)(() => {
      if (!history_default || typeof history_default.listen !== "function") return;
      const unlisten = history_default.listen(({ location, action }) => {
        const nextLoc = (location.pathname || "") + (location.search || "");
        if (nextLoc !== lastLocRef.current) {
          lastLocRef.current = nextLoc;
          setLoc(nextLoc);
          if (typeof dispatch === "function") {
            dispatch({
              type: "LOCATION_CHANGED",
              location: nextLoc,
              meta: { action }
            });
          }
        }
      });
      return () => {
        if (typeof unlisten === "function") unlisten();
      };
    }, [dispatch]);
    const activePathname = (loc || "").split("?")[0];
    const matched = (0, import_react.useMemo)(
      () => matchRoute(preparedRoutes, activePathname),
      [preparedRoutes, activePathname]
    );
    const Component = matched?.Component || (() => null);
    const routeParams = matched?.params || {};
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Component,
      {
        ...state,
        ...routeParams,
        dispatch,
        pageRefresher
      }
    );
  };
  return Router;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Link,
  appHistory,
  createRouter,
  makeMemoryHistory,
  navigate,
  routesHelper
});
//# sourceMappingURL=index.js.map