import React, { useContext } from "react";
import appHistory from "./history";
import { setScrollToSessionStorage } from "./scroll";
import helper from "./helper";
import handleHistoryChange from "./handleHistoryChange";

var handleSyncRegistered = false;

export const Link = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    setScrollToSessionStorage();
    appHistory.push(props.to);
  };

  return (
    <a href={props.to} className={props.className} onClick={handleClick}>
      {props.children}
    </a>
  );
};

export const navigate = (to) => {
  setScrollToSessionStorage();
  appHistory.push(to);
};

// expects a "prepared" list of routes
export const createRouter = (routes, store) => (props) => {
  const appState = store
    ? useContext(store)
    : { state: props, dispatch: false };
  const { state, dispatch } = appState;
  const location = state.location;

  // register the listener once
  if (!handleSyncRegistered && dispatch) {
    handleHistoryChange(dispatch);
    handleSyncRegistered = true;
  }

  const { Component } = helper.match(
    routes,
    location ? location.split("?", 1)[0] : "/"
  );
  return <Component {...state} />;
};
