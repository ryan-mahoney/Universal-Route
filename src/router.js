import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import axios from "axios";
import nprogress from "nprogress";
import uuidv4 from "uuid/v4";
import createHistory from "history/createBrowserHistory";
import AuthorizationComponent from "./AuthorizationComponent.js";
import helper from "./helper";

var appHistory = false;
var getScrollPosition = () => {};
var getScrollFromSessionStorage = () => {};
var setScrollToSessionStorage = () => {};
if (
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
) {
  appHistory = createHistory();

  getScrollPosition = () => ({
    y: window.pageYOffset || document.documentElement.scrollTop,
    x: window.pageXOffset || document.documentElement.scrollLeft
  });

  setScrollToSessionStorage = () => {
    const path = window.location.pathname;
    const data = JSON.stringify(
      Object.assign({}, getScrollFromSessionStorage("*") || {}, {
        path: getScrollPosition()
      })
    );
    sessionStorage.setItem("scroll", data);
  };

  getScrollFromSessionStorage = url => {
    const blob = sessionStorage.getItem("scroll");
    if (!blob) {
      return null;
    }
    const data = JSON.parse(blob);
    if (url == "*") {
      return data;
    }
    return data[url] || null;
  };
}

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
  const mapDispatchToProps = dispatch => {
    return bindActionCreators(actions, dispatch);
  };

  const mapStateToProps = state => {
    return state;
  };

  var changePage = () => {};

  const syncToHistory = () => {
    // handle server case
    if (!appHistory) {
      return;
    }

    // listen for changes to the current location
    appHistory.listen((location, action) => {
      // clear and start
      nprogress.done();
      nprogress.start();

      // decide which path to call
      const uuid = uuidv4();
      let path = `${location.pathname}${location.search}${
        location.search.indexOf("?") !== -1 ? "&" : "?"
      }uuid=${uuid}`;

      // do XHR request
      axios
        .get(path, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        })
        .then(response => {
          let data = {
            page: Object.assign({}, response.data.page, {
              location: location.pathname
            })
          };

          // handle authorization based redirection
          if (response.data.page.authorization) {
            data.page.location = "/no-access";
            if (response.data.page.authorization.location) {
              data.page.location = response.data.page.authorization.location;
            }
          } else if (response.data.page.error) {
            data.page.location = "/error";
          }
          changePage(data.page);
          nprogress.done();

          if (action == "PUSH") {
            window.scrollTo(0, 0);
          } else {
            const previousScroll = getScrollFromSessionStorage(
              window.location.pathname
            );
            if (previousScroll) {
              setTimeout(() => {
                window.scrollTo(previousScroll.x, previousScroll.y);
              }, 250);
            }
          }
        })
        .catch(error => {
          nprogress.done();
          changePage(Object.assign({}, error, { location: "/error" }));
        });
    });
  };

  syncToHistory();

  const Router = props => {
    changePage = props.changePage;
    const { Component } = helper.match(
      routes,
      props.page.location.split("?", 1)[0],
      UnknownComponent
    );
    return <Component {...props} />;
  };

  return connect(mapStateToProps, mapDispatchToProps)(Router);
};
