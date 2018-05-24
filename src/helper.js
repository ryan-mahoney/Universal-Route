import React from "react";
import pathToRegexp from "path-to-regexp";

const match = (routes, location) =>
  routes.reduce(
    (accululator, route) =>
      accululator ? accululator : route.re.exec(location) ? route : false,
    false
  );

const Generic404 = () => (
  <div>
    <h1>404</h1>
    <p>Page not found</p>
  </div>
);

export default {
  match: (routes, location) => {
    let route = match(routes, location);
    if (!route) {
      route = match(routes, "/404");
    }
    if (!route) {
      route = { Component: Generic404 };
    }
    return route;
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
