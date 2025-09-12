"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = void 0;
exports["default"] = handleHistoryChange;
var _uuid = require("uuid");
var _scroll = require("./scroll.js");
// src/handleHistoryChange.js

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
  url.searchParams.set("uuid", (0, _uuid.v4)());
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