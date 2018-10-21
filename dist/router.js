(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "react", "./history", "./scroll", "./helper", "./handleHistoryChange"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("react"), require("./history"), require("./scroll"), require("./helper"), require("./handleHistoryChange"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react, global.history, global.scroll, global.helper, global.handleHistoryChange);
    global.router = mod.exports;
  }
})(this, function (exports, _react, _history, _scroll, _helper, _handleHistoryChange) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createRouter = exports.navigate = exports.Link = undefined;

  var _react2 = _interopRequireDefault(_react);

  var _history2 = _interopRequireDefault(_history);

  var _helper2 = _interopRequireDefault(_helper);

  var _handleHistoryChange2 = _interopRequireDefault(_handleHistoryChange);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var handleSyncRegistered = false;

  var Link = exports.Link = function Link(props) {
    var handleClick = function handleClick(e) {
      e.preventDefault();
      (0, _scroll.setScrollToSessionStorage)();
      _history2.default.push(props.to);
    };

    return _react2.default.createElement(
      "a",
      { href: props.to, className: props.className, onClick: handleClick },
      props.children
    );
  };

  var navigate = exports.navigate = function navigate(to) {
    (0, _scroll.setScrollToSessionStorage)();
    _history2.default.push(to);
  };

  // expects a "prepared" list of routes
  var createRouter = exports.createRouter = function createRouter(routes) {
    return function (props) {
      // register the listener once
      if (!handleSyncRegistered) {
        (0, _handleHistoryChange2.default)(props.changePage);
        handleSyncRegistered = true;
      }

      var _helper$match = _helper2.default.match(routes, props.page && props.page.location ? props.page.location.split("?", 1)[0] : "/"),
          Component = _helper$match.Component;

      return _react2.default.createElement(Component, props);
    };
  };
});