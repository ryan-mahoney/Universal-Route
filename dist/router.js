(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "babel-runtime/regenerator", "babel-runtime/core-js/object/assign", "babel-runtime/helpers/asyncToGenerator", "react", "redux", "react-redux", "axios", "nprogress", "uuid/v4", "history/createBrowserHistory", "./helper", "./scroll"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("babel-runtime/regenerator"), require("babel-runtime/core-js/object/assign"), require("babel-runtime/helpers/asyncToGenerator"), require("react"), require("redux"), require("react-redux"), require("axios"), require("nprogress"), require("uuid/v4"), require("history/createBrowserHistory"), require("./helper"), require("./scroll"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.regenerator, global.assign, global.asyncToGenerator, global.react, global.redux, global.reactRedux, global.axios, global.nprogress, global.v4, global.createBrowserHistory, global.helper, global.scroll);
    global.router = mod.exports;
  }
})(this, function (exports, _regenerator, _assign, _asyncToGenerator2, _react, _redux, _reactRedux, _axios, _nprogress, _v, _createBrowserHistory, _helper, _scroll) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createRouter = exports.navigate = exports.Link = undefined;

  var _regenerator2 = _interopRequireDefault(_regenerator);

  var _assign2 = _interopRequireDefault(_assign);

  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

  var _react2 = _interopRequireDefault(_react);

  var _axios2 = _interopRequireDefault(_axios);

  var _nprogress2 = _interopRequireDefault(_nprogress);

  var _v2 = _interopRequireDefault(_v);

  var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

  var _helper2 = _interopRequireDefault(_helper);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var handleSyncRegistered = false;

  // create app history if possible
  var appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? (0, _createBrowserHistory2.default)() : false;

  var Link = exports.Link = function Link(props) {
    var handleClick = function handleClick(e) {
      e.preventDefault();
      (0, _scroll.setScrollToSessionStorage)();
      appHistory.push(props.to);
    };

    return _react2.default.createElement(
      "a",
      { href: props.to, className: props.className, onClick: handleClick },
      props.children
    );
  };

  var navigate = exports.navigate = function navigate(to) {
    (0, _scroll.setScrollToSessionStorage)();
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

    // initilize a place-holder for the last request cancellation token
    var requestCancellation = false;

    var Router = function Router(props) {
      var handleHistoryChange = function handleHistoryChange() {
        // handle server case
        if (!appHistory) {
          return;
        }

        // listen for changes to the current location
        appHistory.listen(function () {
          var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(location, action) {
            var uuid, path, CancelToken, response, data, previousScroll;
            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    // clear and start
                    _nprogress2.default.done();
                    _nprogress2.default.start();

                    // decide which path to call
                    uuid = (0, _v2.default)();
                    path = "" + location.pathname + location.search + (location.search.indexOf("?") !== -1 ? "&" : "?") + "uuid=" + uuid;

                    // do XHR request

                    CancelToken = _axios2.default.CancelToken;

                    if (requestCancellation) {
                      requestCancellation.cancel("Override a previous request");
                    }
                    requestCancellation = CancelToken.source();
                    _context.next = 9;
                    return _axios2.default.get(path, {
                      cancelToken: requestCancellation.token,
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token")
                      }
                    }).catch(function (error) {
                      return error.response || null;
                    });

                  case 9:
                    response = _context.sent;


                    // stop displaying progress bar
                    _nprogress2.default.done();

                    // if there was not response, do nothing

                    if (!(response === null)) {
                      _context.next = 13;
                      break;
                    }

                    return _context.abrupt("return");

                  case 13:
                    if (!(response.status[0] == 5)) {
                      _context.next = 16;
                      break;
                    }

                    props.changePage((0, _assign2.default)({}, response.data, { location: "/500" }));
                    return _context.abrupt("return");

                  case 16:
                    if (!(response.status == 404)) {
                      _context.next = 19;
                      break;
                    }

                    props.changePage((0, _assign2.default)({}, response.data, { location: "/404" }));
                    return _context.abrupt("return");

                  case 19:
                    data = (0, _assign2.default)({}, response.data.page, {
                      location: location.pathname
                    });

                    // handle authorization based redirection

                    if (response.data.page.authorization) {
                      data.location = response.data.page.authorization.location ? response.data.page.authorization.location : "/unauthorized";
                    }

                    // call change page redux action to trigger re-rendering
                    props.changePage(data);

                    // set page title
                    document.title = response.data.title ? response.data.title : "";

                    if (action == "PUSH") {
                      window.scrollTo(0, 0);
                    } else {
                      previousScroll = (0, _scroll.getScrollFromSessionStorage)(window.location.pathname);

                      if (previousScroll) {
                        setTimeout(function () {
                          window.scrollTo(previousScroll.x, previousScroll.y);
                        }, 250);
                      }
                    }

                  case 24:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, undefined);
          }));

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }());
      };

      // register the listener once
      if (!handleSyncRegistered) {
        handleHistoryChange();
      }
      handleSyncRegistered = true;

      var _helper$match = _helper2.default.match(routes, props.page.location.split("?", 1)[0], UnknownComponent),
          Component = _helper$match.Component;

      return _react2.default.createElement(Component, props);
    };

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Router);
  };
});