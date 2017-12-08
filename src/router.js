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
export const createRouter = (routes, actions, UnknownComponent) => {

  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(actions, dispatch);
  };

  const mapStateToProps = (state) => {
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
      let path = location.pathname + ((location.pathname.indexOf('?') !== -1) ? '&' : '?') + 'uuid=' + uuid;
    
      // do XHR request
      axios.get(path, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }).then((response) => {
        let data = {page: Object.assign(response.data.page, {location: location.pathname})};
        
        // handle authorization based redirection
        if (response.data.page.authorization) {
          data.page.location = '/no-access';
          if (response.data.page.authorization.location) {
            data.page.location = response.data.page.authorization.location;
          }
        } else if (response.data.page.error) {
          data.page.location = '/error';
        }
        changePage(data.page);   
        nprogress.done();
      }).catch((error) => {
        nprogress.done();
        changePage(Object.assign(error, {location: '/error'}));
      });
    });
  };

  syncToHistory();

  const Router = (props) => {
    changePage = props.changePage;
    const path = (props.page && props.page.location) ? props.page.location : props.location;
    const { Component } = helper.match(routes, path, UnknownComponent);
    return (<Component {...props} />);
  };

  return connect(mapStateToProps, mapDispatchToProps)(Router);
};
