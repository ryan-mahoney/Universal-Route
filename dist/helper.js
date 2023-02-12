"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _pathToRegexp = require("path-to-regexp");
var _match = function match(routes, location) {
  return routes.reduce(function (acc, route) {
    return acc ? acc : route.re.exec(location) ? route : false;
  }, false);
};
var Generic404 = function Generic404() {
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("h1", null, "404"), /*#__PURE__*/_react["default"].createElement("p", null, "Page not found"));
};
var _default = {
  match: function match(routes, location) {
    var route = _match(routes, location);
    if (!route) {
      route = _match(routes, "/404");
    }
    if (!route) {
      route = {
        Component: Generic404
      };
    }
    return route;
  },
  prepare: function prepare(routes) {
    return Object.keys(routes).map(function (route) {
      var routeKeys = [];
      var re = (0, _pathToRegexp.pathToRegexp)(route, routeKeys);
      var component, reducer;

      // handle a case where we want to be able to filter props by reducer key later
      if (Object.prototype.toString.call(routes[route]) === "[object Array]") {
        component = routes[route][0];
        reducer = routes[route][1];
      } else {
        component = routes[route];
      }
      return {
        re: re,
        keys: routeKeys,
        Component: component,
        reducerKey: reducer
      };
    });
  }
};
exports["default"] = _default;