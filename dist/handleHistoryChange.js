"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _history = _interopRequireDefault(require("./history"));

var _nprogress = _interopRequireDefault(require("nprogress"));

var _axios = _interopRequireDefault(require("axios"));

var _uuid = require("uuid");

var _scroll = require("./scroll");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// initialize a place-holder for the last request cancellation token
var requestCancellation = false;
var lastLocation = null;

var _default = function _default(dispatch) {
  // handle server rendered case
  if (!_history["default"]) {
    return;
  } // listen for changes to the current location


  _history["default"].listen( /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(historyEvent) {
      var location, action, check, uuid, path, CancelToken, response, data, previousScroll;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              location = historyEvent.location, action = historyEvent.action; // set scroll position for replace

              if (action == "REPLACE") {
                (0, _scroll.setScrollToSessionStorage)();
              } // determine if location actually change, ignoring hash changes


              check = "".concat(location.state ? "".concat(location.state, ":") : "").concat(location.pathname).concat(location.search ? "?".concat(location.search) : "");

              if (!(check === lastLocation && location.hash !== "")) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return");

            case 5:
              lastLocation = check; // clear and start

              _nprogress["default"].done();

              _nprogress["default"].start(); // decide which path to call


              uuid = (0, _uuid.v4)();
              path = "".concat(location.pathname).concat(location.search).concat(location.search.indexOf("?") !== -1 ? "&" : "?", "uuid=").concat(uuid); // do XHR request

              CancelToken = _axios["default"].CancelToken;

              if (requestCancellation) {
                requestCancellation.cancel("Override a previous request");
              }

              requestCancellation = CancelToken.source();
              _context.next = 15;
              return _axios["default"].get(path, {
                cancelToken: requestCancellation.token,
                headers: {
                  "Content-Type": "application/json"
                }
              })["catch"](function (error) {
                return error.response || null;
              });

            case 15:
              response = _context.sent;

              // stop displaying progress bar
              _nprogress["default"].done(); // if there was not response, do nothing


              if (!(response === null)) {
                _context.next = 19;
                break;
              }

              return _context.abrupt("return");

            case 19:
              if (!(response.status[0] == 5)) {
                _context.next = 22;
                break;
              }

              dispatch({
                type: "CHANGE_PAGE",
                data: _objectSpread(_objectSpread({}, response.data), {}, {
                  location: "/500"
                })
              });
              return _context.abrupt("return");

            case 22:
              if (!(response.status == 404)) {
                _context.next = 25;
                break;
              }

              dispatch({
                type: "CHANGE_PAGE",
                data: _objectSpread(_objectSpread({}, response.data), {}, {
                  location: "/404"
                })
              });
              return _context.abrupt("return");

            case 25:
              data = _objectSpread(_objectSpread({}, response.data), {}, {
                location: location.pathname
              }); // handle authorization based redirection

              if (response.data.authorization) {
                data.location = response.data.authorization.location ? response.data.authorization.location : "/unauthorized";
              } // call change page action to trigger re-rendering


              dispatch({
                type: "CHANGE_PAGE",
                data: data
              }); // set page title

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

            case 30:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
};

exports["default"] = _default;