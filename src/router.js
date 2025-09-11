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

export const createRouter = ({ routesMap, reducer, initialState = {} }) => {
  const preparedRoutes = helper.prepare(routesMap);

  const RouterView = () => {
    const [state, dispatch] = React.useReducer(reducer, {
      ...initialState,
      location:
        (appHistory &&
          appHistory.location.pathname + (appHistory.location.search || "")) ||
        "/",
    });

    React.useEffect(() => {
      if (!appHistory) return;
      const unlisten = appHistory.listen(({ location }) => {
        const nextLoc = location.pathname + (location.search || "");
        dispatch({ type: "LOCATION_CHANGED", location: nextLoc });
      });
      dispatch({
        type: "LOCATION_CHANGED",
        location:
          appHistory.location.pathname + (appHistory.location.search || ""),
      });
      return () => unlisten();
    }, []);

    React.useEffect(() => {
      if (!handleSyncRegistered && dispatch) {
        handleHistoryChange(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);

    const pathOnly = (state.location || "/").split("?", 1)[0];

    console.log("pathOnly", pathOnly);

    const { Component, params } = helper.match(preparedRoutes, pathOnly);

    console.log("Component", Component);
    console.log("params", params);

    return <Component {...state} params={params} dispatch={dispatch} />;
  };

  return RouterView;
};

export default { Link, navigate, createRouter };
