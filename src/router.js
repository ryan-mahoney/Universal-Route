import React from "react";
import appHistory from "./history.js";
import { setScrollToSessionStorage } from "./scroll.js";
import helper from "./helper.js";
import handleHistoryChange from "./handleHistoryChange.js";

let handleSyncRegistered = false;

export const Link = ({
  to,
  className,
  children,
  mode = "push",
  onMouseEnter,
  onMouseLeave,
  style = {},
  ...rest
}) => {
  const onClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }
    e.preventDefault();
    setScrollToSessionStorage();
    if (!appHistory) return;
    if (mode === "replace") {
      appHistory.replace(to);
    } else {
      appHistory.push(to);
    }
  };

  return (
    <a
      href={to}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      {...rest}
    >
      {children}
    </a>
  );
};

export const navigate = (to, mode = "push") => {
  if (!appHistory) return;
  if (mode === "replace") appHistory.replace(to);
  else appHistory.push(to);
};

/**
 * API: createRouter(routes, storeContext) => RouterComponent
 * A store is REQUIRED. There is no store-less mode.
 */
export const createRouter = (routes, store) => {
  if (!store) {
    throw new Error(
      "createRouter(routes, store): a store/context is required. Wrap your app with a Provider that supplies {state, dispatch}."
    );
  }

  const Router = () => {
    // Prepare routes once
    const preparedRoutesRef = React.useRef(null);
    if (!preparedRoutesRef.current) {
      preparedRoutesRef.current = helper.prepare(routes);
    }

    // Pull state/dispatch from required store
    const appState = React.useContext(store);
    if (
      !appState ||
      typeof appState !== "object" ||
      !("state" in appState) ||
      typeof appState.dispatch !== "function"
    ) {
      throw new Error(
        "Router: expected context value {state, dispatch}. Ensure your <StateProvider> supplies both."
      );
    }

    const { state, dispatch } = appState;

    // Sync history -> store
    React.useEffect(() => {
      if (!dispatch || !appHistory) return;

      const unlisten = appHistory.listen(({ location }) => {
        const nextLoc = location.pathname + (location.search || "");
        dispatch({ type: "LOCATION_CHANGED", location: nextLoc });
      });

      // initial sync (hydrate if state.location is missing or stale)
      dispatch({
        type: "LOCATION_CHANGED",
        location:
          appHistory.location.pathname + (appHistory.location.search || ""),
      });

      return () => unlisten();
    }, [dispatch]);

    // Register network/side-effect sync once (per app shell)
    React.useEffect(() => {
      if (!handleSyncRegistered && dispatch) {
        handleHistoryChange(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);

    // Location is sourced ONLY from store
    const currentLocation = state.location || "/";
    const pathOnly = currentLocation.split("?", 1)[0];

    const { Component, params } = helper.match(
      preparedRoutesRef.current,
      pathOnly
    );

    return <Component {...state} params={params} dispatch={dispatch} />;
  };

  return Router;
};

export default { Link, navigate, createRouter };
