(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'babel-runtime/core-js/object/assign', 'react', 'create-react-class', 'redux', 'react-redux', 'axios', 'nprogress', 'uuid/v4', 'history/createBrowserHistory', './AuthorizationComponent.js', './helper.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('babel-runtime/core-js/object/assign'), require('react'), require('create-react-class'), require('redux'), require('react-redux'), require('axios'), require('nprogress'), require('uuid/v4'), require('history/createBrowserHistory'), require('./AuthorizationComponent.js'), require('./helper.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.assign, global.react, global.createReactClass, global.redux, global.reactRedux, global.axios, global.nprogress, global.v4, global.createBrowserHistory, global.AuthorizationComponent, global.helper);
    global.router = mod.exports;
  }
})(this, function (exports, _assign, _react, _createReactClass, _redux, _reactRedux, _axios, _nprogress, _v, _createBrowserHistory, _AuthorizationComponent, _helper) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createRouter = exports.navigate = exports.Link = undefined;

  var _assign2 = _interopRequireDefault(_assign);

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
  var createRouter = exports.createRouter = function createRouter(routes, actions, UnknownComponent) {

    var mapDispatchToProps = function mapDispatchToProps(dispatch) {
      return (0, _redux.bindActionCreators)(actions, dispatch);
    };

    var mapStateToProps = function mapStateToProps(state) {
      return state;
    };

    var changePage = function changePage() {};

    var syncToHistory = function syncToHistory() {
      // handle server case
      if (!appHistory) {
        return;
      }

      // listen for changes to the current location
      appHistory.listen(function (location, action) {

        // clear and start
        _nprogress2.default.done();
        _nprogress2.default.start();

        // decide which path to call
        var uuid = (0, _v2.default)();
        var path = location.pathname + (location.pathname.indexOf('?') !== -1 ? '&' : '?') + 'uuid=' + uuid;

        // do XHR request
        _axios2.default.get(path, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }).then(function (response) {
          var data = { page: (0, _assign2.default)(response.data.page, { location: location.pathname }) };

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
          _nprogress2.default.done();
        }).catch(function (error) {
          _nprogress2.default.done();
          changePage((0, _assign2.default)(error, { location: '/error' }));
        });
      });
    };

    syncToHistory();

    var Router = function Router(props) {
      changePage = props.changePage;
      var path = props.page && props.page.location ? props.page.location : props.location;

      var _helper$match = _helper2.default.match(routes, path, UnknownComponent),
          Component = _helper$match.Component;

      return _react2.default.createElement(Component, props);
    };

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Router);
  };
});