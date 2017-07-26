import React from 'react';
import createReactClass from 'create-react-class';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import nprogress from 'nprogress';
import Guid from 'guid';
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

  return connect(mapStateToProps, mapDispatchToProps)(createReactClass({

    handleUnlisten: () => {},

    componentDidMount: function () {
      // if an init function was specified as a property, call it
      if ('init' in this.props) {
        this.props.init();
      }
    },

    componentWillMount: function () {
      // handle server case
      if (!appHistory) {
        return;
      }

      // listen for changes to the current location
      this.handleUnlisten = appHistory.listen((location, action) => {

        // decide which path to call
        let path;
        const guid = Guid.raw();
        if (location.pathname.indexOf('?') !== -1) {
          path = location.pathname + '&guid=' + guid;
        } else {
          path = location.pathname + '?guid=' + guid;
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
            this.props.changePageAuth(response.authorization);
            return;
          }

          // call action
          let pageData = {
            location: location.pathname
          };
          if (response.payload) {
            pageData.payload = response.payload;
          } else {
            pageData.payload = response;
          }
          nprogress.done();
          this.props.changePage(pageData);
        }).catch((error) => {
          nprogress.done();
          this.props.changePageError("Server Error");
        });
      });
    },

    componentWillUnmount: function () {
      this.handleUnlisten();
    },

    render: function () {
      const path = (typeof location !== 'undefined') ? location.pathname : this.props.location;
      const { Component } = helper.match(routes, path, UnknownComponent);
      let props = this.props.page || {};
      let error = this.props.error || null;
      let auth = this.props.auth || null;

      // handle error
      if (error) {
        return (<ErrorComponent error={error} />);
      }

      // handle auth
      if (auth) {
        return (<AuthorizationComponent {...auth} />);
      }

      // include all the action functions
      Object.keys(this.props).forEach((propKey) => {
        if (Object.prototype.toString.call(this.props[propKey]) === '[object Function]') {
          props[propKey] = this.props[propKey];
        }
      });

      // return the component from the router with the appropriate props
      return (<Component {...props} />);
    }
  }));
};
