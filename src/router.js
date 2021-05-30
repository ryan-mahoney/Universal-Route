import React, { useContext } from "react";
import appHistory from "./history";
import { setScrollToSessionStorage } from "./scroll";
import helper from "./helper";
import handleHistoryChange from "./handleHistoryChange";

var handleSyncRegistered = false;

export const Link = ({ to, className, children, mode = "push", onMouseEnter, onMouseLeave }) => {
  const handleClick = e => {
    e.preventDefault();
    if (mode === "push") {
      setScrollToSessionStorage();
      appHistory.push(to);
    }
    if (mode === "replace") {
      appHistory.replace(to);
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </a>
  );
};

export const navigate = (to, mode = "push") => {
  if (mode === "push") {
    setScrollToSessionStorage();
    appHistory.push(to);
  }
  if (mode === "replace") {
    appHistory.replace(to);
  }
};

// expects a "prepared" list of routes
export const createRouter = (routes, store) => props => {
  const appState = store ? useContext(store) : { state: props, dispatch: false };
  const { state, dispatch } = appState;
  const location = state.location;

  // register the listener once
  if (!handleSyncRegistered && dispatch) {
    handleHistoryChange(dispatch);
    handleSyncRegistered = true;
  }

  const { Component } = helper.match(routes, location ? location.split("?", 1)[0] : "/");
  return <Component {...state} dispatch={dispatch} />;
};
