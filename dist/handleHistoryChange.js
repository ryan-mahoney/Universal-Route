"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _history = _interopRequireDefault(require("./history"));

var _nprogress = _interopRequireDefault(require("nprogress"));

var _axios = _interopRequireDefault(require("axios"));

var _uuid = require("uuid");

var _scroll = require("./scroll");

// initilize a place-holder for the last request cancellation token
var requestCancellation = false;
var lastLocation = null;

var _default = function _default(changePage) {
  // handle server rendered case
  if (!_history["default"]) {
    return;
  } // listen for changes to the current location


  _history["default"].listen( /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(location, action) {
      var check, uuid, path, CancelToken, response, data, previousScroll;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // determine if location actually change, ignoring hash changes
              check = "".concat(location.state ? "".concat(location.state, ":") : "").concat(location.pathname).concat(location.search ? "?".concat(location.search) : "");

              if (!(check === lastLocation && location.hash !== "")) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return");

            case 3:
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
              _context.next = 13;
              return _axios["default"].get(path, {
                cancelToken: requestCancellation.token,
                headers: {
                  "Content-Type": "application/json"
                }
              })["catch"](function (error) {
                return error.response || null;
              });

            case 13:
              response = _context.sent;

              // stop displaying progress bar
              _nprogress["default"].done(); // if there was not response, do nothing


              if (!(response === null)) {
                _context.next = 17;
                break;
              }

              return _context.abrupt("return");

            case 17:
              if (!(response.status[0] == 5)) {
                _context.next = 20;
                break;
              }

              changePage(Object.assign({}, response.data, {
                location: "/500"
              }));
              return _context.abrupt("return");

            case 20:
              if (!(response.status == 404)) {
                _context.next = 23;
                break;
              }

              changePage(Object.assign({}, response.data, {
                location: "/404"
              }));
              return _context.abrupt("return");

            case 23:
              data = Object.assign({}, response.data.page, {
                location: location.pathname
              }); // handle authorization based redirection

              if (response.data.page.authorization) {
                data.location = response.data.page.authorization.location ? response.data.page.authorization.location : "/unauthorized";
              } // call change page action to trigger re-rendering


              changePage(data); // set page title

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

            case 28:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

exports["default"] = _default;