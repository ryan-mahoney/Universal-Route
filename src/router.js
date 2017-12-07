import React from 'react';
import createReactClass from 'create-react-class';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import nprogress from 'nprogress';
import uuidv4 from 'uuid/v4';
import createHistory from 'history/createBrowserHistory';
import AuthorizationComponent from './AuthorizationComponent.js';

// local dependencies
import helper from './helper.js';

var appHistory = false;
if (typeof window !== 'undefined' && window.document && window.document.createElement) {
  appHistory = createHistory();
}

export const Link = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    appHistory.push(props.to);
  };

  const className = (props.className) ? props.className : '';
  return (<a href={props.to} className={className} onClick={handleClick}>{props.children}</a>);
};

export const navigate = (to) => {
  appHistory.push(to);
};

// expects all routes, actions and a 404 React component to be passed in
export const createRouter = (routes, actions, UnknownComponent, ErrorComponent) => {

  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actions, dispatch);
  };

  const mapStateToProps = (state) => {
    return state;
  };

  var changePageAuth = () => {};
  var changePageError = () => {};
  var changePage = () => {};

  const syncToHistory = () => {
    // handle server case
    if (!appHistory) {
      return;
    }
  
    // listen for changes to the current location
    appHistory.listen((location, action) => {
  
      // decide which path to call
      let path;
      const uuid = uuidv4();
      if (location.pathname.indexOf('?') !== -1) {
        path = location.pathname + '&uuid=' + uuid;
      } else {
        path = location.pathname + '?uuid=' + uuid;
      }
  
      // clear and start
      nprogress.done();
      nprogress.start();
  
      // do XHR request
      axios.get(path, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }).then((response) => {
  
        // handle authorization based redirection
        if (response.authorization) {
          nprogress.done();
          changePageAuth(response.authorization);
          return;
        }
  
        // call action
        let pageData = {payload: {}};
        if (response.data.payload) {
          pageData.payload = response.data.payload;
        } else {
          pageData.payload = response.data;
        }
        pageData.payload.location = location.pathname;
        
        nprogress.done();
        changePage(pageData);
      }).catch((error) => {
        nprogress.done();
        changePageError("Server Error");
      });
    });
  };

  syncToHistory();

  const Router = (props) => {
    changePageAuth = props.changePageAuth;
    changePageError = props.changePageError;
    changePage = props.changePage;

    var path = props.location;
    if (props.page && props.page.data && props.page.data.location) {
      path = props.page.data.location;
    }

    const { Component } = helper.match(routes, path, UnknownComponent);
    let propsOut = props.page.data || {};
    const error = props.page.error || null;
    const auth = props.page.auth || null;

    // handle error
    if (error) {
      return (<ErrorComponent error={error} />);
    }

    // handle auth
    if (auth) {
      return (<AuthorizationComponent {...auth} />);
    }

    // include all the action functions
    Object.keys(props).forEach((propKey) => {
      if (Object.prototype.toString.call(props[propKey]) === '[object Function]') {
        propsOut[propKey] = props[propKey];
      }
    });

    // return the component from the router with the appropriate props
    return (<Component {...propsOut} />);
  };

  return connect(mapStateToProps, mapDispatchToProps)(Router);
};
