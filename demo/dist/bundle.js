// app.js
import React4 from "react";
import { createRoot } from "react-dom/client";

// mockFetch.js
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

// ../src/router.js
import React2 from "react";

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
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

// ../src/history.js
var appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? createBrowserHistory() : null;
var history_default = appHistory;

// ../src/scroll.js
var SCROLL_KEY = "scroll";
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
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch {
  }
};
var setScrollToSessionStorage = () => {
  const store = readStore();
  store[currentKey()] = getScrollPosition();
  writeStore(store);
};
var getScrollFromSessionStorage = (key = "*") => {
  const store = readStore();
  if (key === "*") return store;
  return store[key] || null;
};

// ../src/helper.js
import React from "react";

// ../src/pathToRegex.js
function lexer(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      let name = "";
      let j = i + 1;
      while (j < str.length) {
        const code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError(`Missing parameter name at ${i}`);
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      let count = 1;
      let pattern = "";
      let j = i + 1;
      if (str[j] === "?") {
        throw new TypeError(`Pattern cannot start with "?" at ${j}`);
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError(`Capturing groups are not allowed at ${j}`);
          }
        }
        pattern += str[j++];
      }
      if (count) throw new TypeError(`Unbalanced pattern at ${i}`);
      if (!pattern) throw new TypeError(`Missing pattern at ${i}`);
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse(str, options = {}) {
  const tokens = lexer(str);
  const { prefixes = "./", delimiter = "/#?" } = options;
  const result = [];
  let key = 0;
  let i = 0;
  let path = "";
  const tryConsume = (type) => {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  };
  const mustConsume = (type) => {
    const value = tryConsume(type);
    if (value !== void 0) return value;
    const { type: nextType, index } = tokens[i];
    throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
  };
  const consumeText = () => {
    let result2 = "";
    let value;
    while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value;
    }
    return result2;
  };
  const isSafe = (value) => {
    for (const char of delimiter) if (value.indexOf(char) > -1) return true;
    return false;
  };
  const safePattern = (prefix) => {
    const prev = result[result.length - 1];
    const prevText = prefix || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError(
        `Must have text between two parameters, missing text after "${prev.name}"`
      );
    }
    if (!prevText || isSafe(prevText)) return `[^${escapeString(delimiter)}]+?`;
    return `(?:(?!${escapeString(prevText)})[^${escapeString(delimiter)}])+?`;
  };
  while (i < tokens.length) {
    const char = tryConsume("CHAR");
    const name = tryConsume("NAME");
    const pattern = tryConsume("PATTERN");
    if (name || pattern) {
      let prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    const value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    const open = tryConsume("OPEN");
    if (open) {
      const prefix = consumeText();
      const name2 = tryConsume("NAME") || "";
      const pattern2 = tryConsume("PATTERN") || "";
      const suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name2 || (pattern2 ? key++ : ""),
        pattern: name2 && !pattern2 ? safePattern(prefix) : pattern2,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function match(str, options) {
  const keys = [];
  const re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options = {}) {
  const { decode = (x) => x } = options;
  return function(pathname) {
    const m = re.exec(pathname);
    if (!m) return false;
    const { 0: path, index } = m;
    const params = /* @__PURE__ */ Object.create(null);
    for (let i = 1; i < m.length; i++) {
      if (m[i] === void 0) continue;
      const key = keys[i - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i].split(key.prefix + key.suffix).map((value) => {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i], key);
      }
    }
    return { path, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path, keys) {
  if (!keys) return path;
  const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  let index = 0;
  let execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
function arrayToRegexp(paths, keys, options) {
  const parts = paths.map((path) => pathToRegexp(path, keys, options).source);
  return new RegExp(`(?:${parts.join("|")})`, flags(options));
}
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
function tokensToRegexp(tokens, keys, options = {}) {
  const {
    strict = false,
    start = true,
    end = true,
    encode = (x) => x,
    delimiter = "/#?",
    endsWith = ""
  } = options;
  const endsWithRe = `[${escapeString(endsWith)}]|$`;
  const delimiterRe = `[${escapeString(delimiter)}]`;
  let route = start ? "^" : "";
  for (const token of tokens) {
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      const prefix = escapeString(encode(token.prefix));
      const suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys) keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            const mod = token.modifier === "*" ? "?" : "";
            route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
          } else {
            route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError(
              `Can not repeat "${token.name}" without a prefix and suffix`
            );
          }
          route += `(${token.pattern})${token.modifier}`;
        }
      } else {
        route += `(?:${prefix}${suffix})${token.modifier}`;
      }
    }
  }
  if (end) {
    if (!strict) route += `${delimiterRe}?`;
    route += !options.endsWith ? "$" : `(?=${endsWithRe})`;
  } else {
    const endToken = tokens[tokens.length - 1];
    const isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += `(?:${delimiterRe}(?=${endsWithRe}))?`;
    }
    if (!isEndDelimited) {
      route += `(?=${delimiterRe}|${endsWithRe})`;
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

// ../src/helper.js
var Generic404 = () => /* @__PURE__ */ React.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React.createElement("h1", null, "404"), /* @__PURE__ */ React.createElement("p", null, "Page not found"));
var matchOne = (preparedRoutes, location2) => {
  for (const r of preparedRoutes) {
    const res = r.matcher(location2);
    if (res) {
      return { route: r, params: res.params || {} };
    }
  }
  return null;
};
var helper_default = {
  match: (preparedRoutes, location2) => {
    const m = matchOne(preparedRoutes, location2);
    if (!m) return { Component: Generic404, reducerKey: null, params: {} };
    const { route, params } = m;
    const { Component, reducerKey } = route;
    return { Component, reducerKey, params };
  },
  prepare: (routesMap2) => Object.keys(routesMap2).map((path) => {
    const defn = routesMap2[path];
    let component, reducerKey;
    if (Array.isArray(defn)) {
      [component, reducerKey] = defn;
    } else {
      component = defn;
    }
    return {
      path,
      matcher: match(path, { decode: decodeURIComponent }),
      Component: component,
      reducerKey: reducerKey || null
    };
  })
};

// ../node_modules/uuid/dist/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// ../node_modules/uuid/dist/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// ../node_modules/uuid/dist/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// ../node_modules/uuid/dist/v4.js
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  return _v4(options, buf, offset);
}
var v4_default = v4;

// ../src/handleHistoryChange.js
var INSTALLED = Symbol.for("handleHistoryChange:installed");
var _inFlight = null;
function originOf() {
  try {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      return window.location.origin;
    }
  } catch (e) {
  }
  return "http://localhost";
}
function buildUrl(loc) {
  const url = new URL((loc.pathname || "/") + (loc.search || ""), originOf());
  url.searchParams.set("uuid", v4_default());
  return url.toString();
}
function kindFrom(status) {
  if (status === 404) return "404";
  if (Math.floor(status / 100) === 5) return "5xx";
  return "ok";
}
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
    return;
  }
  if (history[INSTALLED]) {
    return;
  }
  history[INSTALLED] = true;
  history.listen(function({ location: location2, action }) {
    if (_inFlight && typeof _inFlight.abort === "function") {
      try {
        _inFlight.abort();
      } catch (e) {
      }
    }
    _inFlight = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (progress && typeof progress.done === "function") progress.done();
    if (progress && typeof progress.start === "function") progress.start();
    const url = buildUrl(location2);
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
    }).catch(function(err) {
      return { status: 503, data: {} };
    }).then(function({ status, data }) {
      if (progress && typeof progress.done === "function") progress.done();
      const authLoc = data && data.authorization && data.authorization.location;
      let finalLoc = authLoc || location2.pathname || "/";
      if (!authLoc) {
        const k = kindFrom(status);
        if (k === "404") finalLoc = "/404";
        else if (k === "5xx") finalLoc = "/500";
      }
      dispatch({
        type: "CHANGE_PAGE",
        data: Object.assign({}, data, { location: finalLoc })
      });
      if (data && data.title) {
        setTitle(data.title);
      }
      if (typeof window !== "undefined" && window.scrollTo) {
        if (action === "PUSH") {
          window.scrollTo(0, 0);
        } else {
          const key = (location2.pathname || "/") + (location2.search || "");
          const prev = getScrollFromSessionStorage(key);
          if (prev) {
            setTimeout(function() {
              window.scrollTo(prev.x || 0, prev.y || 0);
            }, 250);
          }
        }
      }
    });
  });
}

// ../src/router.js
var handleSyncRegistered = false;
var Link = ({
  to,
  className,
  children,
  mode = "push",
  onMouseEnter,
  onMouseLeave,
  style = {},
  ...rest
}) => {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    setScrollToSessionStorage();
    if (!history_default) return;
    if (mode === "replace") {
      history_default.replace(to);
    } else {
      history_default.push(to);
    }
  };
  return /* @__PURE__ */ React2.createElement(
    "a",
    {
      href: to,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      style,
      ...rest
    },
    children
  );
};
var createRouter = ({ routesMap: routesMap2, reducer: reducer2, initialState: initialState2 = {} }) => {
  const preparedRoutes = helper_default.prepare(routesMap2);
  const RouterView = () => {
    const [state, dispatch] = React2.useReducer(reducer2, {
      ...initialState2,
      location: history_default && history_default.location.pathname + (history_default.location.search || "") || "/"
    });
    React2.useEffect(() => {
      if (!history_default) return;
      const unlisten = history_default.listen(({ location: location2 }) => {
        const nextLoc = location2.pathname + (location2.search || "");
        dispatch({ type: "LOCATION_CHANGED", location: nextLoc });
      });
      dispatch({
        type: "LOCATION_CHANGED",
        location: history_default.location.pathname + (history_default.location.search || "")
      });
      return () => unlisten();
    }, []);
    React2.useEffect(() => {
      if (!handleSyncRegistered && dispatch) {
        handleHistoryChange(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);
    const pathOnly = (state.location || "/").split("?", 1)[0];
    const { Component, params } = helper_default.match(preparedRoutes, pathOnly);
    return /* @__PURE__ */ React2.createElement(Component, { ...state, params, dispatch });
  };
  return RouterView;
};

// routes.js
import React3 from "react";
var Home = (props) => {
  return /* @__PURE__ */ React3.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React3.createElement("h1", null, "Home"), /* @__PURE__ */ React3.createElement("p", null, "This is a tiny demo using the modernized router."), /* @__PURE__ */ React3.createElement("nav", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"), /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About"), /* @__PURE__ */ React3.createElement(Link, { to: "/users/42" }, "User 42")), /* @__PURE__ */ React3.createElement("pre", { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } }, JSON.stringify({ state: props }, null, 2)));
};
var About = (props) => {
  return /* @__PURE__ */ React3.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React3.createElement("h1", null, "About"), /* @__PURE__ */ React3.createElement("p", null, "Try navigating with modifier keys to open in a new tab."), /* @__PURE__ */ React3.createElement("nav", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"), /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About"), /* @__PURE__ */ React3.createElement(Link, { to: "/users/123" }, "User 123")), /* @__PURE__ */ React3.createElement("pre", { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } }, JSON.stringify({ state: props }, null, 2)));
};
var User = ({ params, ...props }) => {
  return /* @__PURE__ */ React3.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React3.createElement("h1", null, "User"), /* @__PURE__ */ React3.createElement("p", null, "User ID: ", /* @__PURE__ */ React3.createElement("strong", null, params.id)), /* @__PURE__ */ React3.createElement("nav", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"), /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About")), /* @__PURE__ */ React3.createElement("pre", { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } }, JSON.stringify({ params, state: props }, null, 2)));
};
var routesMap = {
  "/": Home,
  "/about": About,
  "/users/:id": User
};
var routes_default = routesMap;

// reducer.js
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

// app.js
installMockFetch();
var AppRouter = createRouter({ routesMap: routes_default, reducer, initialState });
var root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React4.createElement(AppRouter, null));
//# sourceMappingURL=bundle.js.map
