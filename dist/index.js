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
  getScrollFromSessionStorage: () => getScrollFromSessionStorage,
  getScrollPosition: () => getScrollPosition,
  handleHistoryChange: () => handleHistoryChange,
  makeMemoryHistory: () => makeMemoryHistory,
  navigate: () => navigate,
  routesHelper: () => helper_default,
  setScrollForKey: () => setScrollForKey,
  setScrollToSessionStorage: () => setScrollToSessionStorage
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
var decodeParam = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
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
        Object.entries(m.groups).map(([k, v]) => [k, decodeParam(v)])
      ) : names.reduce((acc, name, i) => {
        acc[name] = decodeParam(m[i + 1]);
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
var getHistoryOrThrow = () => {
  if (!appHistory2) {
    throw new Error(
      "History is unavailable in this environment. Use makeMemoryHistory for non-browser usage."
    );
  }
  return appHistory2;
};
var navigate = (to, options = {}) => {
  const { replace = false, state } = options;
  const activeHistory = getHistoryOrThrow();
  if (replace) activeHistory.replace(to, state);
  else activeHistory.push(to, state);
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
    const activeHistory = getHistoryOrThrow();
    const nextTo = toClientPath(to, href);
    if (replace) activeHistory.replace(nextTo, state);
    else activeHistory.push(nextTo, state);
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
    const readHistoryLocation = () => (history_default?.location?.pathname || "") + (history_default?.location?.search || "");
    const initialLocation = state && state.location || readHistoryLocation();
    const lastLocRef = (0, import_react.useRef)(initialLocation);
    const hasNavigationRef = (0, import_react.useRef)(false);
    const getLocationSnapshot = () => hasNavigationRef.current ? readHistoryLocation() : initialLocation;
    const loc = (0, import_react.useSyncExternalStore)(
      (onStoreChange) => {
        if (!history_default || typeof history_default.listen !== "function") return () => {
        };
        const unlisten = history_default.listen(({ location, action }) => {
          const nextLoc = (location.pathname || "") + (location.search || "");
          if (nextLoc !== lastLocRef.current) {
            lastLocRef.current = nextLoc;
            hasNavigationRef.current = true;
            if (typeof dispatch === "function") {
              dispatch({
                type: "LOCATION_CHANGED",
                location: nextLoc,
                meta: { action }
              });
            }
          }
          onStoreChange();
        });
        return () => {
          if (typeof unlisten === "function") unlisten();
        };
      },
      getLocationSnapshot,
      getLocationSnapshot
    );
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

// src/scroll.ts
var SCROLL_KEY = "scroll";
var MAX_SCROLL_ENTRIES = 100;
var getScrollPosition = () => ({
  y: window.pageYOffset || document.documentElement.scrollTop || 0,
  x: window.pageXOffset || document.documentElement.scrollLeft || 0
});
var currentKey = () => {
  const { pathname, search } = window.location;
  return `${pathname}${search || ""}`;
};
var readStore = () => {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const blob = sessionStorage.getItem(SCROLL_KEY);
    return blob ? JSON.parse(blob) : {};
  } catch {
    return {};
  }
};
var writeStore = (obj) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    const keys = Object.keys(obj);
    if (keys.length > MAX_SCROLL_ENTRIES) {
      const excess = keys.length - MAX_SCROLL_ENTRIES;
      for (let i = 0; i < excess; i += 1) {
        delete obj[keys[i]];
      }
    }
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch {
  }
};
var setScrollToSessionStorage = () => {
  const store = readStore();
  const key = currentKey();
  if (store[key]) delete store[key];
  store[key] = getScrollPosition();
  writeStore(store);
};
var setScrollForKey = (key, pos) => {
  const store = readStore();
  if (store[key]) delete store[key];
  store[key] = pos || getScrollPosition();
  writeStore(store);
};
function getScrollFromSessionStorage(key) {
  const store = readStore();
  if (key === "*" || key === void 0) return store;
  return store[key] || null;
}

// src/handleHistoryChange.ts
var makeUuid = () => {
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    if (typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    const buf = new Uint8Array(16);
    globalThis.crypto.getRandomValues(buf);
    buf[6] = buf[6] & 15 | 64;
    buf[8] = buf[8] & 63 | 128;
    const hex = [...buf].map((b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }
  try {
    const { randomUUID } = globalThis.require("node:crypto");
    if (typeof randomUUID === "function") return randomUUID();
  } catch {
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var INSTALLED = /* @__PURE__ */ Symbol.for("handleHistoryChange:installed");
var _inFlight = null;
var _latestRequestId = 0;
var _scrollRestoreTimeout = null;
var clearScrollRestoreTimeout = () => {
  if (_scrollRestoreTimeout) {
    clearTimeout(_scrollRestoreTimeout);
    _scrollRestoreTimeout = null;
  }
};
var originOf = () => {
  try {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      return window.location.origin;
    }
  } catch {
  }
  return "http://localhost";
};
var buildUrl = (loc) => {
  const url = new URL((loc.pathname || "/") + (loc.search || ""), originOf());
  url.searchParams.set("uuid", makeUuid());
  return url.toString();
};
var kindFrom = (status) => {
  if (status === 404) return "404";
  if (Math.floor(status / 100) === 5) return "5xx";
  return "ok";
};
function handleHistoryChange(dispatch, {
  history,
  fetchImpl = typeof fetch !== "undefined" && fetch || null,
  setTitle = function(t) {
    if (typeof document !== "undefined" && t) document.title = t;
  },
  progress = { start() {
  }, done() {
  } }
  // optional in tests
} = {}) {
  if (!history || !fetchImpl) {
    return () => {
    };
  }
  if (history[INSTALLED]) {
    return () => {
    };
  }
  history[INSTALLED] = true;
  const unlisten = history.listen(function({ location, action }) {
    if (_inFlight && typeof _inFlight.abort === "function") {
      try {
        _inFlight.abort();
      } catch {
      }
    }
    clearScrollRestoreTimeout();
    const requestId = ++_latestRequestId;
    _inFlight = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (progress && typeof progress.done === "function") progress.done();
    if (progress && typeof progress.start === "function") progress.start();
    const url = buildUrl(location);
    Promise.resolve(
      fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: _inFlight ? _inFlight.signal : void 0
      })
    ).then(function(res) {
      const jp = res && res.json ? res.json() : {};
      return Promise.resolve(jp).then(function(data) {
        return { status: res ? res.status : 503, data: data || {} };
      }).catch(function() {
        return { status: res ? res.status : 503, data: {} };
      });
    }).catch(function() {
      return { status: 503, data: {} };
    }).then(function({ status, data }) {
      if (requestId !== _latestRequestId) return;
      if (progress && typeof progress.done === "function") progress.done();
      const authLoc = data.authorization?.location;
      let finalLoc = authLoc || location.pathname || "/";
      if (!authLoc) {
        const k = kindFrom(status);
        if (k === "404") finalLoc = "/404";
        else if (k === "5xx") finalLoc = "/500";
      }
      dispatch({
        type: "CHANGE_PAGE",
        data: Object.assign({}, data, { location: finalLoc })
      });
      const title = data.title;
      if (title) {
        setTitle(title);
      }
      if (typeof window !== "undefined" && window.scrollTo) {
        if (action === "PUSH") {
          window.scrollTo(0, 0);
        } else {
          const key = (location.pathname || "/") + (location.search || "");
          const prev = getScrollFromSessionStorage(key);
          if (prev) {
            _scrollRestoreTimeout = setTimeout(function() {
              window.scrollTo(prev.x || 0, prev.y || 0);
              _scrollRestoreTimeout = null;
            }, 250);
          }
        }
      }
    });
  });
  return () => {
    if (typeof unlisten === "function") unlisten();
    clearScrollRestoreTimeout();
    if (_inFlight && typeof _inFlight.abort === "function") {
      try {
        _inFlight.abort();
      } catch {
      }
    }
    _inFlight = null;
    history[INSTALLED] = false;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Link,
  appHistory,
  createRouter,
  getScrollFromSessionStorage,
  getScrollPosition,
  handleHistoryChange,
  makeMemoryHistory,
  navigate,
  routesHelper,
  setScrollForKey,
  setScrollToSessionStorage
});
//# sourceMappingURL=index.js.map