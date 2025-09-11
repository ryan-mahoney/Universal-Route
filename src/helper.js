import React from "react";
import { match } from "path-to-regexp";

const Generic404 = () => (
  <div style={{ padding: 24 }}>
    <h1>404</h1>
    <p>Page not found</p>
  </div>
);

const matchOne = (preparedRoutes, location) => {
  for (const r of preparedRoutes) {
    const res = r.matcher(location);
    if (res) {
      return { route: r, params: res.params || {} };
    }
  }
  return null;
};

export default {
  match: (preparedRoutes, location) => {
    const m = matchOne(preparedRoutes, location);
    if (!m) return { Component: Generic404, reducerKey: null, params: {} };
    const { route, params } = m;
    const { Component, reducerKey } = route;
    return { Component, reducerKey, params };
  },
  prepare: (routesMap) =>
    Object.keys(routesMap).map((path) => {
      const defn = routesMap[path];
      let component, reducerKey;
      if (Array.isArray(defn)) {
        [component, reducerKey] = defn;
      } else {
        component = defn;
      }
      return {
        path,
        matcher: match(path, { decode: decodeURIComponent }),
        Component: component,
        reducerKey: reducerKey || null
      };
    })
};
