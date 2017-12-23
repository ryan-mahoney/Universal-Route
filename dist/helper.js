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
      // loop through all the routes
      var route = routes.map(function (route) {
        // attempt to match
        if (route.re.exec(location)) {
          return route;
        }
        // remove null elements
      }).filter(function (route) {
        if (route) {
          return true;
        }
        return false;
        // condense array to object
      }).reduce(function (result, item) {
        return item;
      }, {});

      // we couldn't match anything
      if ((0, _keys2.default)(route).length == 0) {
        return { Component: UnknownComponent };
      }

      // send the route
      return route;
    },

    prepare: function prepare(routes) {
      // loop over all routes
      return (0, _keys2.default)(routes).map(function (route) {
        var routeKeys = [];
        var re = (0, _pathToRegexp2.default)(route, routeKeys);
        var component, reducer;

        // handle a case where we want to be able to filter props by reducer key later
        if (Object.prototype.toString.call(routes[route]) === '[object Array]') {
          component = routes[route][0];
          reducer = routes[route][1];
        } else {
          component = routes[route];
        }

        // send out a more useful data structure
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