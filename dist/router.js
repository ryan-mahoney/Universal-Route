"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports.createRouter = exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _history = _interopRequireDefault(require("./history"));

var _scroll = require("./scroll");

var _helper = _interopRequireDefault(require("./helper"));

var _handleHistoryChange = _interopRequireDefault(require("./handleHistoryChange"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var handleSyncRegistered = false;

var Link = function Link(_ref) {
  var to = _ref.to,
      className = _ref.className,
      children = _ref.children,
      _ref$mode = _ref.mode,
      mode = _ref$mode === void 0 ? "push" : _ref$mode,
      onMouseEnter = _ref.onMouseEnter,
      onMouseLeave = _ref.onMouseLeave;

  var handleClick = function handleClick(e) {
    e.preventDefault();

    if (mode === "push") {
      (0, _scroll.setScrollToSessionStorage)();

      _history["default"].push(to);
    }

    if (mode === "replace") {
      _history["default"].replace(to);
    }
  };

  return /*#__PURE__*/_react["default"].createElement("a", {
    href: to,
    className: className,
    onClick: handleClick,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave
  }, children);
};

exports.Link = Link;

var navigate = function navigate(to) {
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "push";

  if (mode === "push") {
    (0, _scroll.setScrollToSessionStorage)();

    _history["default"].push(to);
  }

  if (mode === "replace") {
    _history["default"].replace(to);
  }
}; // expects a "prepared" list of routes


exports.navigate = navigate;

var createRouter = function createRouter(routes, store) {
  return function (props) {
    var appState = store ? (0, _react.useContext)(store) : {
      state: props,
      dispatch: false
    };
    var state = appState.state,
        dispatch = appState.dispatch;
    var location = state.location; // register the listener once

    if (!handleSyncRegistered && dispatch) {
      (0, _handleHistoryChange["default"])(dispatch);
      handleSyncRegistered = true;
    }

    var _helper$match = _helper["default"].match(routes, location ? location.split("?", 1)[0] : "/"),
        Component = _helper$match.Component;

    return /*#__PURE__*/_react["default"].createElement(Component, (0, _extends2["default"])({}, state, {
      dispatch: dispatch
    }));
  };
};

exports.createRouter = createRouter;