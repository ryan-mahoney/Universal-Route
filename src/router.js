import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import history from "./history.js";
import helper from "./helper.js";

/** Programmatic navigation helper */
export const navigate = (to, { replace = false, state } = {}) => {
  if (replace) history.replace(to, state);
  else history.push(to, state);
};

/** Tiny <Link> that routes via shared history without full page reloads. */
export const Link = ({ to, replace = false, state, onClick, ...rest }) => {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 || // left click
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return;
    }
    e.preventDefault();
    if (replace) history.replace(to, state);
    else history.push(to, state);
  };
  return (
    <a
      href={typeof to === "string" ? to : to?.pathname || "#"}
      onClick={handleClick}
      {...rest}
    />
  );
};

/** Simple exact-path matcher with optional "*" catch-all. */
const matchRoute = (routes, pathname) => {
  const exact = routes.find((r) => r.path === pathname);

  if (exact) return exact;
  return routes.find((r) => r.path === "*") || null;
};

/**
 * createRouter(routes, storeContext?) => <Router />
 *
 * - If a store context is provided, the router will use {state, dispatch} from it.
 * - If no store context is provided, props are treated as state and dispatch=false.
 * - Assumes initial store already has the current location; DOES NOT dispatch on mount.
 * - Listens to history and dispatches LOCATION_CHANGED only when location truly changes.
 */
export const createRouter = (routes, storeContext) => (props) => {
  const appState = storeContext
    ? useContext(storeContext)
    : { state: props, dispatch: false };

  const { state, dispatch } = appState || {};

  routes = helper.prepare(routes);

  const currentFromHistory =
    (history?.location?.pathname || "") + (history?.location?.search || "");

  const initialLocation = (state && state.location) || currentFromHistory;

  // Track last known full location string (path + search)
  const lastLocRef = useRef(initialLocation);

  // Keep local state so the component re-renders on navigation
  const [loc, setLoc] = useState(initialLocation);

  useEffect(() => {
    if (!history || typeof history.listen !== "function") return;

    const unlisten = history.listen(({ location, action }) => {
      const nextLoc = (location.pathname || "") + (location.search || "");
      if (nextLoc !== lastLocRef.current) {
        lastLocRef.current = nextLoc;
        setLoc(nextLoc); // trigger re-render
        if (typeof dispatch === "function") {
          dispatch({
            type: "LOCATION_CHANGED",
            location: nextLoc,
            meta: { action },
          });
        }
      }
    });

    return () => {
      if (typeof unlisten === "function") unlisten();
    };
  }, [dispatch]);

  const activePathname = (loc || "").split("?")[0];
  const matched = useMemo(
    () => matchRoute(routes, activePathname),
    [routes, activePathname]
  );

  const Component = matched?.Component || (() => null);
  return <Component {...state} dispatch={dispatch} />;
};

export default createRouter;
