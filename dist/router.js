"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports["default"] = exports.createRouter = exports.Link = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireDefault(require("react"));
var _history = _interopRequireDefault(require("./history.js"));
var _scroll = require("./scroll.js");
var _helper = _interopRequireDefault(require("./helper.js"));
var _handleHistoryChange = _interopRequireDefault(require("./handleHistoryChange.js"));
var _excluded = ["to", "className", "children", "mode", "onMouseEnter", "onMouseLeave", "style"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var handleSyncRegistered = false;
var Link = exports.Link = function Link(_ref) {
  var to = _ref.to,
    className = _ref.className,
    children = _ref.children,
    _ref$mode = _ref.mode,
    mode = _ref$mode === void 0 ? "push" : _ref$mode,
    onMouseEnter = _ref.onMouseEnter,
    onMouseLeave = _ref.onMouseLeave,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style,
    rest = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  var onClick = function onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    (0, _scroll.setScrollToSessionStorage)();
    if (!_history["default"]) return;
    if (mode === "replace") {
      _history["default"].replace(to);
    } else {
      _history["default"].push(to);
    }
  };
  return /*#__PURE__*/_react["default"].createElement("a", (0, _extends2["default"])({
    href: to,
    className: className,
    onClick: onClick,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    style: style
  }, rest), children);
};
var navigate = exports.navigate = function navigate(to) {
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "push";
  if (!_history["default"]) return;
  if (mode === "replace") _history["default"].replace(to);else _history["default"].push(to);
};
var createRouter = exports.createRouter = function createRouter(routesMap, reducer) {
  var initialState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var preparedRoutes = _helper["default"].prepare(routesMap);
  var RouterView = function RouterView() {
    var _React$useReducer = _react["default"].useReducer(reducer, _objectSpread(_objectSpread({}, initialState), {}, {
        location: _history["default"] && _history["default"].location.pathname + (_history["default"].location.search || "") || "/"
      })),
      _React$useReducer2 = (0, _slicedToArray2["default"])(_React$useReducer, 2),
      state = _React$useReducer2[0],
      dispatch = _React$useReducer2[1];
    _react["default"].useEffect(function () {
      if (!_history["default"]) return;
      var unlisten = _history["default"].listen(function (_ref2) {
        var location = _ref2.location;
        var nextLoc = location.pathname + (location.search || "");
        dispatch({
          type: "LOCATION_CHANGED",
          location: nextLoc
        });
      });
      dispatch({
        type: "LOCATION_CHANGED",
        location: _history["default"].location.pathname + (_history["default"].location.search || "")
      });
      return function () {
        return unlisten();
      };
    }, []);
    _react["default"].useEffect(function () {
      if (!handleSyncRegistered && dispatch) {
        (0, _handleHistoryChange["default"])(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);
    var pathOnly = (state.location || "/").split("?", 1)[0];
    var _helper$match = _helper["default"].match(preparedRoutes, pathOnly),
      Component = _helper$match.Component,
      params = _helper$match.params;
    return /*#__PURE__*/_react["default"].createElement(Component, (0, _extends2["default"])({}, state, {
      params: params,
      dispatch: dispatch
    }));
  };
  return RouterView;
};
var _default = exports["default"] = {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter
};