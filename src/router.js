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
    mode === "replace" ? appHistory.replace(to) : appHistory.push(to);
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
  mode === "replace" ? appHistory.replace(to) : appHistory.push(to);
};

// createRouter(routes, store?) => (props) => <Component/>
export const createRouter = (routes, store) => (props) => {
  // prepare routes once
  const preparedRoutesRef = React.useRef(null);
  if (!preparedRoutesRef.current) {
    preparedRoutesRef.current = helper.prepare(routes);
  }

  // store is OPTIONAL: fall back to props when absent
  const appState = store
    ? React.useContext(store)
    : { state: props || {}, dispatch: false };

  const { state = {}, dispatch = false } = appState || {};

  // Only wire effects when we actually have a dispatch function
  React.useEffect(() => {
    if (!(dispatch && typeof dispatch === "function") || !appHistory) return;

    const sync = ({ location }) => {
      const nextLoc = location.pathname + (location.search || "");
      dispatch({ type: "LOCATION_CHANGED", location: nextLoc });
    };
    const unlisten = appHistory.listen(sync);

    // initial sync
    dispatch({
      type: "LOCATION_CHANGED",
      location:
        appHistory.location.pathname + (appHistory.location.search || ""),
    });

    return () => unlisten();
  }, [dispatch]);

  React.useEffect(() => {
    if (!handleSyncRegistered && dispatch && typeof dispatch === "function") {
      handleHistoryChange(dispatch);
      handleSyncRegistered = true;
    }
  }, [dispatch]);

  // Derive current location from state; otherwise history; otherwise props; otherwise "/"
  const currentLocation =
    state.location ||
    (appHistory &&
      appHistory.location &&
      appHistory.location.pathname + (appHistory.location.search || "")) ||
    (props && props.location) ||
    "/";

  const pathOnly = String(currentLocation).split("?", 1)[0];
  const { Component, params } = helper.match(
    preparedRoutesRef.current,
    pathOnly
  );

  return <Component {...state} params={params} dispatch={dispatch} />;
};

export default { Link, navigate, createRouter };
