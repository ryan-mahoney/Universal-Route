import React from "react";
import pathToRegexp from "path-to-regexp";

export default {
  match: (routes, location, UnknownComponent) => {
    // loop through all the routes
    const route = routes.map((route) => {
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
      return {Component: UnknownComponent};
    }

    // send the route
    return route;
  },

  prepare: (routes) => {
    // loop over all routes
    return Object.keys(routes).map((route) => {
      var routeKeys = [];
      var re = pathToRegexp(route, routeKeys);
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
