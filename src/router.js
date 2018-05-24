import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import appHistory from "./history";
import uuidv4 from "uuid/v4";
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

// expects all routes, actions and a 404 React component to be passed in
export const createRouter = (routes, actions, UnknownComponent) => {
  const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);
  const mapStateToProps = state => state;

  const Router = props => {
    // register the listener once
    if (!handleSyncRegistered) {
      handleHistoryChange();
      handleSyncRegistered = true;
    }

    const { Component } = helper.match(
      routes,
      props.page.location.split("?", 1)[0],
      UnknownComponent
    );
    return <Component {...props} />;
  };

  return connect(mapStateToProps, mapDispatchToProps)(Router);
};
