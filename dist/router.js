(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'babel-runtime/core-js/object/keys', 'react', 'create-react-class', 'redux', 'react-redux', 'axios', 'nprogress', 'uuid/v4', 'history/createBrowserHistory', './AuthorizationComponent.js', './helper.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('babel-runtime/core-js/object/keys'), require('react'), require('create-react-class'), require('redux'), require('react-redux'), require('axios'), require('nprogress'), require('uuid/v4'), require('history/createBrowserHistory'), require('./AuthorizationComponent.js'), require('./helper.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.keys, global.react, global.createReactClass, global.redux, global.reactRedux, global.axios, global.nprogress, global.v4, global.createBrowserHistory, global.AuthorizationComponent, global.helper);
    global.router = mod.exports;
  }
})(this, function (exports, _keys, _react, _createReactClass, _redux, _reactRedux, _axios, _nprogress, _v, _createBrowserHistory, _AuthorizationComponent, _helper) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createRouter = exports.navigate = exports.Link = undefined;

  var _keys2 = _interopRequireDefault(_keys);

  var _react2 = _interopRequireDefault(_react);

  var _createReactClass2 = _interopRequireDefault(_createReactClass);

  var _axios2 = _interopRequireDefault(_axios);

  var _nprogress2 = _interopRequireDefault(_nprogress);

  var _v2 = _interopRequireDefault(_v);

  var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

  var _AuthorizationComponent2 = _interopRequireDefault(_AuthorizationComponent);

  var _helper2 = _interopRequireDefault(_helper);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var appHistory = false;

  // local dependencies

  if (typeof window !== 'undefined' && window.document && window.document.createElement) {
    appHistory = (0, _createBrowserHistory2.default)();
  }

  var Link = exports.Link = function Link(props) {
    var handleClick = function handleClick(e) {
      e.preventDefault();
      appHistory.push(props.to);
    };

    var className = props.className ? props.className : '';
    return _react2.default.createElement(
      'a',
      { href: props.to, className: className, onClick: handleClick },
      props.children
    );
  };

  var navigate = exports.navigate = function navigate(to) {
    appHistory.push(to);
  };

  // expects all routes, actions and a 404 React component to be passed in
  var createRouter = exports.createRouter = function createRouter(routes, actions, UnknownComponent, ErrorComponent) {

    var mapDispatchToProps = function mapDispatchToProps(dispatch) {
      return (0, _redux.bindActionCreators)(actions, dispatch);
    };

    var mapStateToProps = function mapStateToProps(state) {
      return state;
    };

    var changePageAuth = function changePageAuth() {};
    var changePageError = function changePageError() {};
    var changePage = function changePage() {};

    var syncToHistory = function syncToHistory() {
      // handle server case
      if (!appHistory) {
        return;
      }

      // listen for changes to the current location
      appHistory.listen(function (location, action) {

        // decide which path to call
        var path = void 0;
        var uuid = (0, _v2.default)();
        if (location.pathname.indexOf('?') !== -1) {
          path = location.pathname + '&uuid=' + uuid;
        } else {
          path = location.pathname + '?uuid=' + uuid;
        }

        // clear and start
        _nprogress2.default.done();
        _nprogress2.default.start();

        // do XHR request
        _axios2.default.get(path, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }).then(function (response) {

          // handle authorization based redirection
          if (response.authorization) {
            _nprogress2.default.done();
            changePageAuth(response.authorization);
            return;
          }

          // call action
          var pageData = {
            location: location.pathname
          };
          if (response.data.payload) {
            pageData.payload = response.data.payload;
          } else {
            pageData.payload = response.data;
          }
          _nprogress2.default.done();
          changePage(pageData);
        }).catch(function (error) {
          _nprogress2.default.done();
          changePageError("Server Error");
        });
      });
    };

    syncToHistory();

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _createReactClass2.default)({
      componentDidMount: function componentDidMount() {
        changePageAuth = this.props.changePageAuth;
        changePageError = this.props.changePageError;
        changePage = this.props.changePage;
      },

      render: function render() {
        var _this = this;

        var path = typeof location !== 'undefined' ? location.pathname : this.props.location;

        var _helper$match = _helper2.default.match(routes, path, UnknownComponent),
            Component = _helper$match.Component;

        var props = this.props.page || {};
        var error = this.props.error || null;
        var auth = this.props.auth || null;

        // handle error
        if (error) {
          return _react2.default.createElement(ErrorComponent, { error: error });
        }

        // handle auth
        if (auth) {
          return _react2.default.createElement(_AuthorizationComponent2.default, auth);
        }

        // include all the action functions
        (0, _keys2.default)(this.props).forEach(function (propKey) {
          if (Object.prototype.toString.call(_this.props[propKey]) === '[object Function]') {
            props[propKey] = _this.props[propKey];
          }
        });

        // return the component from the router with the appropriate props
        return _react2.default.createElement(Component, props);
      }
    }));
  };
});