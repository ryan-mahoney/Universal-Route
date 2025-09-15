"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepare = exports.match = exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// src/helper.js
// Route preparation & matching utility for Universal Route.
// Accepts either an array of route objects OR a map of { "/path": Component | [Component, reducerKey] }.

var escapeRegex = function escapeRegex(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

// Compile a path pattern like "/users/:id" into a RegExp with named groups.
// Supports "*" or "/*" catch-all.
var compilePath = function compilePath(path) {
  if (!path || path === "/") {
    return {
      regex: /^\/?$/,
      names: []
    };
  }
  if (path === "*" || path === "/*") {
    return {
      regex: /^.*$/,
      names: []
    };
  }
  var parts = String(path).split("/").filter(Boolean).map(function (part) {
    if (part.startsWith(":")) {
      var name = part.slice(1);
      return {
        src: "(?<".concat(name, ">[^/]+)"),
        name: name
      };
    }
    return {
      src: escapeRegex(part),
      name: null
    };
  });
  var pattern = "^/" + parts.map(function (p) {
    return p.src;
  }).join("/") + "/?$";
  var names = parts.filter(function (p) {
    return p.name;
  }).map(function (p) {
    return p.name;
  });
  return {
    regex: new RegExp(pattern),
    names: names
  };
};

// Graceful 404 Component that renders the text "404" (no React import required)
var Generic404 = function Generic404() {
  return "404";
};

// Normalize a single map entry: (path, value) -> { path, Component, reducerKey }
var normalizeMapEntry = function normalizeMapEntry(path, value) {
  var Component, reducerKey;
  if (Array.isArray(value)) {
    var _value = (0, _slicedToArray2["default"])(value, 2);
    Component = _value[0];
    reducerKey = _value[1];
  } else if (typeof value === "function") {
    Component = value;
  } else if (value && (0, _typeof2["default"])(value) === "object") {
    // Allow object form { Component, element, render, reducerKey }
    Component = value.Component || value.element || value.render || function () {
      return null;
    };
    reducerKey = value.reducerKey;
  } else {
    Component = function Component() {
      return null;
    };
  }
  return {
    path: path,
    Component: Component,
    reducerKey: reducerKey
  };
};

// Normalize a route object from array form: { path, Component | element | render, reducerKey? }
var normalizeArrayEntry = function normalizeArrayEntry() {
  var routeObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _routeObj$path = routeObj.path,
    path = _routeObj$path === void 0 ? "/" : _routeObj$path,
    reducerKey = routeObj.reducerKey;
  var Component = routeObj.Component || routeObj.element || routeObj.render || function () {
    return null;
  };
  return {
    path: path,
    Component: Component,
    reducerKey: reducerKey
  };
};

// Convert routes (array or map) into a uniform list of { path, Component, reducerKey }
var toList = function toList(routes) {
  if (Array.isArray(routes)) {
    return routes.map(normalizeArrayEntry);
  }
  if (routes && (0, _typeof2["default"])(routes) === "object") {
    return Object.entries(routes).map(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        path = _ref2[0],
        value = _ref2[1];
      return normalizeMapEntry(path, value);
    });
  }
  throw new TypeError("routes must be an array of route objects or a map of { path: Component | [Component, reducerKey] }");
};

// Public: prepare routes by attaching a matcher to each entry.
var prepare = exports.prepare = function prepare() {
  var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var list = toList(routes);
  return list.map(function (r) {
    // Catch-all
    if (r.path === "*" || r.path === "/*") {
      return _objectSpread(_objectSpread({}, r), {}, {
        matcher: function matcher() {
          return {
            params: {}
          };
        }
      });
    }
    var _compilePath = compilePath(r.path),
      regex = _compilePath.regex,
      names = _compilePath.names;
    var matcher = function matcher(pathname) {
      var m = regex.exec(pathname);
      if (!m) return null;
      var params = m.groups ? Object.fromEntries(Object.entries(m.groups).map(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
          k = _ref4[0],
          v = _ref4[1];
        return [k, decodeURIComponent(v)];
      })) : names.reduce(function (acc, name, i) {
        acc[name] = decodeURIComponent(m[i + 1]);
        return acc;
      }, {});
      return {
        params: params
      };
    };
    return _objectSpread(_objectSpread({}, r), {}, {
      matcher: matcher
    });
  });
};

// Internal: find a match in a prepared list
var matchOne = function matchOne(preparedRoutes, pathname) {
  var _iterator = _createForOfIteratorHelper(preparedRoutes),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var r = _step.value;
      if (typeof r.matcher !== "function") continue;
      var res = r.matcher(pathname);
      if (res) {
        return {
          Component: r.Component,
          params: res.params || {},
          reducerKey: r.reducerKey
        };
      }
    }

    // Catch-all fallback if provided
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var star = preparedRoutes.find(function (r) {
    return r.path === "*" || r.path === "/*";
  });
  if (star) {
    return {
      Component: star.Component,
      params: {},
      reducerKey: star.reducerKey
    };
  }

  // Generic 404 fallback
  return {
    Component: Generic404,
    params: {}
  };
};

// Public: match() accepts either raw routes or an already-prepared list
var match = exports.match = function match(routesOrPrepared, pathname) {
  var isPreparedArray = Array.isArray(routesOrPrepared) && routesOrPrepared.every(function (r) {
    return (0, _typeof2["default"])(r) === "object" && typeof r.matcher === "function";
  });
  var prepared = isPreparedArray ? routesOrPrepared : prepare(routesOrPrepared);
  return matchOne(prepared, pathname);
};
var _default = exports["default"] = {
  prepare: prepare,
  match: match
};