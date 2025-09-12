"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = void 0;
exports["default"] = handleHistoryChange;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _scroll = require("./scroll.js");
var makeUuid = function makeUuid() {
  // Browser / Workers
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    if (typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    // RFC4122 v4 via getRandomValues
    var buf = new Uint8Array(16);
    globalThis.crypto.getRandomValues(buf);
    buf[6] = buf[6] & 0x0f | 0x40;
    buf[8] = buf[8] & 0x3f | 0x80;
    var hex = (0, _toConsumableArray2["default"])(buf).map(function (b) {
      return b.toString(16).padStart(2, "0");
    });
    return "".concat(hex.slice(0, 4).join(""), "-").concat(hex.slice(4, 6).join(""), "-").concat(hex.slice(6, 8).join(""), "-").concat(hex.slice(8, 10).join(""), "-").concat(hex.slice(10).join(""));
  }
  // Node
  try {
    var _require = require("node:crypto"),
      randomUUID = _require.randomUUID;
    if (typeof randomUUID === "function") return randomUUID();
  } catch (_unused) {}
  // Last-resort (non-crypto)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === "x" ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};
var INSTALLED = Symbol["for"]("handleHistoryChange:installed");
var _inFlight = null;
function originOf() {
  try {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      return window.location.origin;
    }
  } catch (e) {}
  return "http://localhost";
}
function buildUrl(loc) {
  var url = new URL((loc.pathname || "/") + (loc.search || ""), originOf());
  url.searchParams.set("uuid", makeUuid());
  return url.toString();
}
function kindFrom(status) {
  if (status === 404) return "404";
  if (Math.floor(status / 100) === 5) return "5xx";
  return "ok";
}
function handleHistoryChange(dispatch) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    history = _ref.history,
    _ref$fetchImpl = _ref.fetchImpl,
    fetchImpl = _ref$fetchImpl === void 0 ? typeof fetch !== "undefined" && fetch || null : _ref$fetchImpl,
    _ref$setTitle = _ref.setTitle,
    setTitle = _ref$setTitle === void 0 ? function (t) {
      if (typeof document !== "undefined" && t) document.title = t;
    } : _ref$setTitle,
    _ref$progress = _ref.progress,
    progress = _ref$progress === void 0 ? {
      start: function start() {},
      done: function done() {}
    } : _ref$progress;
  if (!history || !fetchImpl) {
    return;
  }
  if (history[INSTALLED]) {
    return;
  }
  history[INSTALLED] = true;
  history.listen(function (_ref2) {
    var location = _ref2.location,
      action = _ref2.action;
    // Abort prior request
    if (_inFlight && typeof _inFlight.abort === "function") {
      try {
        _inFlight.abort();
      } catch (e) {}
    }
    _inFlight = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (progress && typeof progress.done === "function") progress.done();
    if (progress && typeof progress.start === "function") progress.start();
    var url = buildUrl(location);

    // Single promise chain so one microtask drain should be enough in tests
    Promise.resolve(fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: _inFlight ? _inFlight.signal : undefined
    })).then(function (res) {
      var jp = res && res.json ? res.json() : {};
      return Promise.resolve(jp).then(function (data) {
        return {
          status: res ? res.status : 503,
          data: data || {}
        };
      })["catch"](function () {
        return {
          status: res ? res.status : 503,
          data: {}
        };
      });
    })["catch"](function (err) {
      return {
        status: 503,
        data: {}
      };
    }).then(function (_ref3) {
      var status = _ref3.status,
        data = _ref3.data;
      if (progress && typeof progress.done === "function") progress.done();

      // Authorization redirect wins
      var authLoc = data && data.authorization && data.authorization.location;
      var finalLoc = authLoc || location.pathname || "/";

      // Map 404/5xx if no explicit auth redirect
      if (!authLoc) {
        var k = kindFrom(status);
        if (k === "404") finalLoc = "/404";else if (k === "5xx") finalLoc = "/500";
      }
      dispatch({
        type: "CHANGE_PAGE",
        data: Object.assign({}, data, {
          location: finalLoc
        })
      });

      // Title from top-level data.title
      if (data && data.title) {
        // eslint-disable-next-line no-console
        setTitle(data.title);
      }

      // Scroll behavior: top on PUSH; restore for POP/REPLACE
      if (typeof window !== "undefined" && window.scrollTo) {
        if (action === "PUSH") {
          window.scrollTo(0, 0);
        } else {
          var key = (location.pathname || "/") + (location.search || "");
          var prev = (0, _scroll.getScrollFromSessionStorage)(key);
          if (prev) {
            setTimeout(function () {
              window.scrollTo(prev.x || 0, prev.y || 0);
            }, 250);
          }
        }
      }
    });
  });
}

// Test helpers (reset does nothing now because the guard is per-history instance)
var __test__ = exports.__test__ = {
  reset: function reset() {},
  state: function state() {
    return {
      inFlight: !!_inFlight
    };
  }
};