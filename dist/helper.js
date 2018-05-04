(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "babel-runtime/core-js/object/keys", "react", "path-to-regexp"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("babel-runtime/core-js/object/keys"), require("react"), require("path-to-regexp"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.keys, global.react, global.pathToRegexp);
    global.helper = mod.exports;
  }
})(this, function (exports, _keys, _react, _pathToRegexp) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _keys2 = _interopRequireDefault(_keys);

  var _react2 = _interopRequireDefault(_react);

  var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = {
    match: function match(routes, location, UnknownComponent) {
      var route = routes.reduce(function (accululator, route) {
        return accululator ? accululator : route.re.exec(location) ? route : false;
      }, false);

      return route === false ? { Component: UnknownComponent } : route;
    },

    prepare: function prepare(routes) {
      return (0, _keys2.default)(routes).map(function (route) {
        var routeKeys = [];
        var re = (0, _pathToRegexp2.default)(route, routeKeys);
        var component = void 0,
            reducer = void 0;

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
});