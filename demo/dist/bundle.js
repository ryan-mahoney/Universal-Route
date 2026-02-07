// app.tsx
import { createContext, useReducer } from "react";
import { createRoot } from "react-dom/client";

// mockFetch.ts
function installMockFetch({ latency = 120 } = {}) {
  const staticPages = {
    "/": { title: "Home", pageData: { blurb: "Welcome to the demo." } },
    "/about": {
      title: "About",
      pageData: { blurb: "This is a mock backend." }
    }
  };
  const userRoute = /^\/users\/([^/]+)$/;
  globalThis.fetch = async (reqUrl) => {
    const u = new URL(reqUrl, location.origin);
    const path = u.pathname;
    let status = 200;
    let data = staticPages[path];
    if (!data) {
      const m = path.match(userRoute);
      if (m) {
        const id = m[1];
        data = { title: `User ${id}`, pageData: { id, role: "tester" } };
      }
    }
    if (!data) {
      status = 404;
      data = { title: "Not Found", pageData: { path } };
    }
    await new Promise((r) => setTimeout(r, latency));
    return {
      status,
      json: async () => data
    };
  };
}

// ../src/router.tsx
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

// ../node_modules/history/index.js
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
var readOnly = true ? function(obj) {
  return Object.freeze(obj);
} : function(obj) {
  return obj;
};
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
var BeforeUnloadEventType = "beforeunload";
var PopStateEventType = "popstate";
function createBrowserHistory(options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, _options$window = _options.window, window2 = _options$window === void 0 ? document.defaultView : _options$window;
  var globalHistory = window2.history;
  function getIndexAndLocation() {
    var _window$location = window2.location, pathname = _window$location.pathname, search = _window$location.search, hash = _window$location.hash;
    var state = globalHistory.state || {};
    return [state.idx, readOnly({
      pathname,
      search,
      hash,
      state: state.usr || null,
      key: state.key || "default"
    })];
  }
  var blockedPopTx = null;
  function handlePop() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      var nextAction = Action.Pop;
      var _getIndexAndLocation = getIndexAndLocation(), nextIndex = _getIndexAndLocation[0], nextLocation = _getIndexAndLocation[1];
      if (blockers.length) {
        if (nextIndex != null) {
          var delta = index - nextIndex;
          if (delta) {
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry: function retry() {
                go(delta * -1);
              }
            };
            go(delta);
          }
        } else {
          true ? warning(
            false,
            // TODO: Write up a doc that explains our blocking strategy in
            // detail and link to it here so people can understand better what
            // is going on and how to avoid it.
            "You are trying to block a POP navigation to a location that was not created by the history library. The block will fail silently in production, but in general you should do all navigation with the history library (instead of using window.history.pushState directly) to avoid this situation."
          ) : void 0;
        }
      } else {
        applyTx(nextAction);
      }
    }
  }
  window2.addEventListener(PopStateEventType, handlePop);
  var action = Action.Pop;
  var _getIndexAndLocation2 = getIndexAndLocation(), index = _getIndexAndLocation2[0], location2 = _getIndexAndLocation2[1];
  var listeners = createEvents();
  var blockers = createEvents();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function createHref(to) {
    return typeof to === "string" ? to : createPath(to);
  }
  function getNextLocation(to, state) {
    if (state === void 0) {
      state = null;
    }
    return readOnly(_extends({
      pathname: location2.pathname,
      hash: "",
      search: ""
    }, typeof to === "string" ? parsePath(to) : to, {
      state,
      key: createKey()
    }));
  }
  function getHistoryStateAndUrl(nextLocation, index2) {
    return [{
      usr: nextLocation.state,
      key: nextLocation.key,
      idx: index2
    }, createHref(nextLocation)];
  }
  function allowTx(action2, location3, retry) {
    return !blockers.length || (blockers.call({
      action: action2,
      location: location3,
      retry
    }), false);
  }
  function applyTx(nextAction) {
    action = nextAction;
    var _getIndexAndLocation3 = getIndexAndLocation();
    index = _getIndexAndLocation3[0];
    location2 = _getIndexAndLocation3[1];
    listeners.call({
      action,
      location: location2
    });
  }
  function push(to, state) {
    var nextAction = Action.Push;
    var nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }
    if (allowTx(nextAction, nextLocation, retry)) {
      var _getHistoryStateAndUr = getHistoryStateAndUrl(nextLocation, index + 1), historyState = _getHistoryStateAndUr[0], url = _getHistoryStateAndUr[1];
      try {
        globalHistory.pushState(historyState, "", url);
      } catch (error) {
        window2.location.assign(url);
      }
      applyTx(nextAction);
    }
  }
  function replace(to, state) {
    var nextAction = Action.Replace;
    var nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }
    if (allowTx(nextAction, nextLocation, retry)) {
      var _getHistoryStateAndUr2 = getHistoryStateAndUrl(nextLocation, index), historyState = _getHistoryStateAndUr2[0], url = _getHistoryStateAndUr2[1];
      globalHistory.replaceState(historyState, "", url);
      applyTx(nextAction);
    }
  }
  function go(delta) {
    globalHistory.go(delta);
  }
  var history = {
    get action() {
      return action;
    },
    get location() {
      return location2;
    },
    createHref,
    push,
    replace,
    go,
    back: function back() {
      go(-1);
    },
    forward: function forward() {
      go(1);
    },
    listen: function listen(listener) {
      return listeners.push(listener);
    },
    block: function block(blocker) {
      var unblock = blockers.push(blocker);
      if (blockers.length === 1) {
        window2.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }
      return function() {
        unblock();
        if (!blockers.length) {
          window2.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
        }
      };
    }
  };
  return history;
}
function promptBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = "";
}
function createEvents() {
  var handlers = [];
  return {
    get length() {
      return handlers.length;
    },
    push: function push(fn) {
      handlers.push(fn);
      return function() {
        handlers = handlers.filter(function(handler) {
          return handler !== fn;
        });
      };
    },
    call: function call(arg) {
      handlers.forEach(function(fn) {
        return fn && fn(arg);
      });
    }
  };
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function createPath(_ref) {
  var _ref$pathname = _ref.pathname, pathname = _ref$pathname === void 0 ? "/" : _ref$pathname, _ref$search = _ref.search, search = _ref$search === void 0 ? "" : _ref$search, _ref$hash = _ref.hash, hash = _ref$hash === void 0 ? "" : _ref$hash;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  var parsedPath = {};
  if (path) {
    var hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    var searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}

// ../src/history.ts
var appHistory = typeof window !== "undefined" && window.document && typeof window.document.createElement === "function" ? createBrowserHistory() : null;
var history_default = appHistory;

// ../src/helper.ts
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

// ../src/router.tsx
import { jsx } from "react/jsx-runtime";
var appHistory2 = history_default;
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
  return /* @__PURE__ */ jsx("a", { href, onClick: handleClick, ...rest });
};
var matchRoute = (routes, pathname) => helper_default.match(routes, pathname);
var createRouter = (routes, storeContext) => {
  const Router = (props) => {
    const appState = storeContext && useContext(storeContext) || { state: props, dispatch: false };
    const { pageRefresher } = appState;
    const { state, dispatch } = appState;
    const preparedRoutes = useMemo(() => helper_default.prepare(routes), [routes]);
    const currentFromHistory = (history_default?.location?.pathname || "") + (history_default?.location?.search || "");
    const initialLocation = state && state.location || currentFromHistory;
    const lastLocRef = useRef(initialLocation);
    const [loc, setLoc] = useState(initialLocation);
    useEffect(() => {
      if (!history_default || typeof history_default.listen !== "function") return;
      const unlisten = history_default.listen(({ location: location2, action }) => {
        const nextLoc = (location2.pathname || "") + (location2.search || "");
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
    const matched = useMemo(
      () => matchRoute(preparedRoutes, activePathname),
      [preparedRoutes, activePathname]
    );
    const Component = matched?.Component || (() => null);
    const routeParams = matched?.params || {};
    return /* @__PURE__ */ jsx(
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

// routes.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var Home = (props) => {
  return /* @__PURE__ */ jsxs("div", { style: { padding: 24 }, children: [
    /* @__PURE__ */ jsx2("h1", { children: "Home" }),
    /* @__PURE__ */ jsx2("p", { children: "This is a tiny demo using the modernized router." }),
    /* @__PURE__ */ jsxs("nav", { style: { display: "flex", gap: 12 }, children: [
      /* @__PURE__ */ jsx2(Link, { to: "/", children: "Home" }),
      /* @__PURE__ */ jsx2(Link, { to: "/about", children: "About" }),
      /* @__PURE__ */ jsx2(Link, { to: "/users/42", children: "User 42" })
    ] }),
    /* @__PURE__ */ jsx2("pre", { style: { background: "#f6f8fa", padding: 12, marginTop: 16 }, children: JSON.stringify({ state: props }, null, 2) })
  ] });
};
var About = (props) => {
  return /* @__PURE__ */ jsxs("div", { style: { padding: 24 }, children: [
    /* @__PURE__ */ jsx2("h1", { children: "About" }),
    /* @__PURE__ */ jsx2("p", { children: "Try navigating with modifier keys to open in a new tab." }),
    /* @__PURE__ */ jsxs("nav", { style: { display: "flex", gap: 12 }, children: [
      /* @__PURE__ */ jsx2(Link, { to: "/", children: "Home" }),
      /* @__PURE__ */ jsx2(Link, { to: "/about", children: "About" }),
      /* @__PURE__ */ jsx2(Link, { to: "/users/123", children: "User 123" })
    ] }),
    /* @__PURE__ */ jsx2("pre", { style: { background: "#f6f8fa", padding: 12, marginTop: 16 }, children: JSON.stringify({ state: props }, null, 2) })
  ] });
};
var User = ({ id }) => {
  return /* @__PURE__ */ jsxs("div", { style: { padding: 24 }, children: [
    /* @__PURE__ */ jsx2("h1", { children: "User" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "User ID: ",
      /* @__PURE__ */ jsx2("strong", { children: id })
    ] }),
    /* @__PURE__ */ jsxs("nav", { style: { display: "flex", gap: 12 }, children: [
      /* @__PURE__ */ jsx2(Link, { to: "/", children: "Home" }),
      /* @__PURE__ */ jsx2(Link, { to: "/about", children: "About" })
    ] })
  ] });
};
var routesMap = {
  "/": Home,
  "/about": About,
  "/users/:id": User
};
var routes_default = routesMap;

// reducer.ts
var initialState = {
  location: "/",
  title: "Demo",
  pageData: {}
};
function reducer(state, action) {
  switch (action.type) {
    case "LOCATION_CHANGED": {
      return { ...state, location: action.location };
    }
    case "CHANGE_PAGE": {
      const next = { ...state, ...action.data };
      if (action.data && action.data.location) {
        next.location = action.data.location;
      }
      return next;
    }
    default:
      return state;
  }
}

// app.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
installMockFetch();
var StateContext = createContext(null);
var StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return /* @__PURE__ */ jsx3(StateContext.Provider, { value: { state, dispatch }, children });
};
var AppRouter = createRouter(routes_default, StateContext);
var root = createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ jsx3(StateProvider, { children: /* @__PURE__ */ jsx3(AppRouter, {}) })
);
export {
  StateContext
};
//# sourceMappingURL=bundle.js.map
