import React from "react";
import appHistory from "./history";
import { setScrollToSessionStorage } from "./scroll";
import helper from "./helper";
import handleHistoryChange from "./handleHistoryChange";

var handleSyncRegistered = false;

export const Link = props => {
  const handleClick = e => {
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

export const navigate = to => {
  setScrollToSessionStorage();
  appHistory.push(to);
};

// expects a "prepared" list of routes
export const createRouter = routes => props => {
  // register the listener once
  if (!handleSyncRegistered) {
    handleHistoryChange(props.changePage);
    handleSyncRegistered = true;
  }

  const { Component } = helper.match(
    routes,
    props.page && props.page.location
      ? props.page.location.split("?", 1)[0]
      : "/"
  );
  return <Component {...props} />;
};
