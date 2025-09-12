"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _react = _interopRequireDefault(require("react"));
var _pathToRegex = require("./pathToRegex.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var Generic404 = function Generic404() {
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/_react["default"].createElement("h1", null, "404"), /*#__PURE__*/_react["default"].createElement("p", null, "Page not found"));
};
var matchOne = function matchOne(preparedRoutes, location) {
  var _iterator = _createForOfIteratorHelper(preparedRoutes),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var r = _step.value;
      var res = r.matcher(location);
      if (res) {
        return {
          route: r,
          params: res.params || {}
        };
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return null;
};
var _default = exports["default"] = {
  match: function match(preparedRoutes, location) {
    var m = matchOne(preparedRoutes, location);
    if (!m) return {
      Component: Generic404,
      reducerKey: null,
      params: {}
    };
    var route = m.route,
      params = m.params;
    var Component = route.Component,
      reducerKey = route.reducerKey;
    return {
      Component: Component,
      reducerKey: reducerKey,
      params: params
    };
  },
  prepare: function prepare(routesMap) {
    return Object.keys(routesMap).map(function (path) {
      var defn = routesMap[path];
      var component, reducerKey;
      if (Array.isArray(defn)) {
        var _defn = (0, _slicedToArray2["default"])(defn, 2);
        component = _defn[0];
        reducerKey = _defn[1];
      } else {
        component = defn;
      }
      return {
        path: path,
        matcher: (0, _pathToRegex.match)(path, {
          decode: decodeURIComponent
        }),
        Component: component,
        reducerKey: reducerKey || null
      };
    });
  }
};