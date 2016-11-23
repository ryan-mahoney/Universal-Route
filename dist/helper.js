(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'react', 'path-to-regexp'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('react'), require('path-to-regexp'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.react, global.pathToRegexp);
        global.helper = mod.exports;
    }
})(this, function (exports, _react, _pathToRegexp) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = _interopRequireDefault(_react);

    var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = {
        match: function match(Routes, location, Unknown) {
            // loop through all the routes
            var route = Routes.map(function (route) {
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
            if (Object.keys(route).length == 0) {
                return {
                    component: Unknown
                };
            }

            // send the route
            return route;
        },

        prepare: function prepare(Routes) {

            // loop over all routes
            return Object.keys(Routes).map(function (route) {
                var routeKeys = [];
                var re = (0, _pathToRegexp2.default)(route, routeKeys);
                var component, reducer;

                // handle a case where we want to be able to filter props by reducer key later
                if (Object.prototype.toString.call(Routes[route]) === '[object Array]') {
                    component = Routes[route][0];
                    reducer = Routes[route][1];
                } else {
                    component = Routes[route];
                }

                // send out a more useful data structure
                return {
                    re: re,
                    keys: routeKeys,
                    component: component,
                    reducerKey: reducer
                };
            });
        }
    };
});