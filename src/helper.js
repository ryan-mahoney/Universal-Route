// peer dependencies
import React from 'react';

// regular dependency
import pathToRegexp from 'path-to-regexp';

export default {
    match: (Routes, location, Unknown) => {
        // loop through all the routes
        const route = Routes.map((route) => {
            // attempt to match
            if (route.re.exec(location)) {
                return route;
            }

        // remove null elements
        }).filter((route) => {
            if (route) {
                return true;
            }
            return false;

        // condense array to object
        }).reduce((result, item) => {
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

    prepare: (Routes) => {

        // loop over all routes
        return Object.keys(Routes).map((route) => {
            var routeKeys = [];
            var re = pathToRegexp(route, routeKeys);
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
