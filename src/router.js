import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import history from "./history.js";
import helper from "./helper.js";

/** Programmatic navigation helper */
export const navigate = (to, { replace = false, state } = {}) => {
  if (replace) history.replace(to, state);
  else history.push(to, state);
};

const toHref = (to) => {
  if (typeof to === "string") return to;
  if (!to || typeof to !== "object") {
    throw new TypeError("Link 'to' must be a string or location object");
  }
  const { pathname, search = "", hash = "" } = to;
  if (typeof pathname !== "string" || pathname.length === 0) {
    throw new TypeError("Location object 'pathname' must be a non-empty string");
  }
  return `${pathname}${search}${hash}`;
};

const isHttpLikeHref = (href) => {
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return true;
  }
  const protocolMatch = href.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
  if (!protocolMatch) return true;
  const protocol = protocolMatch[1].toLowerCase();
  return protocol === "http" || protocol === "https";
};

const shouldHandleClientNavigation = (event, anchorProps) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return false;
  }
  const { target, download, href } = anchorProps;
  if (download !== undefined) return false;
  if (target && target !== "_self") return false;
  return isHttpLikeHref(href);
};

/** Tiny <Link> that routes via shared history without full page reloads. */
export const Link = ({ to, replace = false, state, onClick, ...rest }) => {
  const href = toHref(to);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!shouldHandleClientNavigation(e, { ...rest, href })) return;
    e.preventDefault();
    if (replace) history.replace(to, state);
    else history.push(to, state);
  };
  return <a href={href} onClick={handleClick} {...rest} />;
};

/** Simple regex path matcher with optional "*" catch-all. */
const matchRoute = (routes, pathname) => {
  return helper.match(routes, pathname);
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

  const { state, dispatch, pageRefresher } = appState || {};

  const preparedRoutes = useMemo(() => helper.prepare(routes), [routes]);

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
    () => matchRoute(preparedRoutes, activePathname),
    [preparedRoutes, activePathname]
  );

  const Component = matched?.Component || (() => null);
  const routeParams = matched?.params || {};
  return (
    <Component
      {...state}
      {...routeParams}
      dispatch={dispatch}
      pageRefresher={pageRefresher}
    />
  );
};

export default createRouter;
