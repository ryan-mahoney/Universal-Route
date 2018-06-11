(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "babel-runtime/regenerator", "babel-runtime/core-js/object/assign", "babel-runtime/helpers/asyncToGenerator", "./history", "nprogress", "axios", "uuid/v4", "./scroll"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("babel-runtime/regenerator"), require("babel-runtime/core-js/object/assign"), require("babel-runtime/helpers/asyncToGenerator"), require("./history"), require("nprogress"), require("axios"), require("uuid/v4"), require("./scroll"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.regenerator, global.assign, global.asyncToGenerator, global.history, global.nprogress, global.axios, global.v4, global.scroll);
    global.handleHistoryChange = mod.exports;
  }
})(this, function (exports, _regenerator, _assign, _asyncToGenerator2, _history, _nprogress, _axios, _v, _scroll) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _regenerator2 = _interopRequireDefault(_regenerator);

  var _assign2 = _interopRequireDefault(_assign);

  var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

  var _history2 = _interopRequireDefault(_history);

  var _nprogress2 = _interopRequireDefault(_nprogress);

  var _axios2 = _interopRequireDefault(_axios);

  var _v2 = _interopRequireDefault(_v);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  // initilize a place-holder for the last request cancellation token
  var requestCancellation = false;

  exports.default = function (changePage) {
    // handle server rendered case
    if (!_history2.default) {
      return;
    }

    // listen for changes to the current location
    _history2.default.listen(function () {
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
                    "Content-Type": "application/json"
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

                changePage((0, _assign2.default)({}, response.data, { location: "/500" }));
                return _context.abrupt("return");

              case 16:
                if (!(response.status == 404)) {
                  _context.next = 19;
                  break;
                }

                changePage((0, _assign2.default)({}, response.data, { location: "/404" }));
                return _context.abrupt("return");

              case 19:
                data = (0, _assign2.default)({}, response.data.page, {
                  location: location.pathname
                });

                // handle authorization based redirection

                if (response.data.page.authorization) {
                  data.location = response.data.page.authorization.location ? response.data.page.authorization.location : "/unauthorized";
                }

                // call change page action to trigger re-rendering
                changePage(data);

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
});