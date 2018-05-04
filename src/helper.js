import React from "react";
import pathToRegexp from "path-to-regexp";

export default {
  match: (routes, location, UnknownComponent) => {
    const route = routes.reduce(
      (accululator, route) =>
        accululator ? accululator : route.re.exec(location) ? route : false,
      false
    );

    return route === false ? { Component: UnknownComponent } : route;
  },

  prepare: routes =>
    Object.keys(routes).map(route => {
      const routeKeys = [];
      const re = pathToRegexp(route, routeKeys);
      let component, reducer;

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
    })
};
