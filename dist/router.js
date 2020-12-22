"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRouter = exports.navigate = exports.Link = void 0;

var _react = _interopRequireDefault(require("react"));

var _history = _interopRequireDefault(require("./history"));

var _scroll = require("./scroll");

var _helper = _interopRequireDefault(require("./helper"));

var _handleHistoryChange = _interopRequireDefault(require("./handleHistoryChange"));

var handleSyncRegistered = false;

var Link = function Link(props) {
  var handleClick = function handleClick(e) {
    e.preventDefault();
    (0, _scroll.setScrollToSessionStorage)();

    _history["default"].push(props.to);
  };

  return /*#__PURE__*/_react["default"].createElement("a", {
    href: props.to,
    className: props.className,
    onClick: handleClick
  }, props.children);
};

exports.Link = Link;

var navigate = function navigate(to) {
  (0, _scroll.setScrollToSessionStorage)();

  _history["default"].push(to);
}; // expects a "prepared" list of routes


exports.navigate = navigate;

var createRouter = function createRouter(routes) {
  return function (props) {
    // register the listener once
    if (!handleSyncRegistered) {
      (0, _handleHistoryChange["default"])(props.changePage);
      handleSyncRegistered = true;
    }

    var _helper$match = _helper["default"].match(routes, props.page && props.page.location ? props.page.location.split("?", 1)[0] : "/"),
        Component = _helper$match.Component;

    return /*#__PURE__*/_react["default"].createElement(Component, props);
  };
};

exports.createRouter = createRouter;