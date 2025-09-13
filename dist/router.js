"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports["default"] = exports.createRouter = exports.Link = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireDefault(require("react"));
var _history = _interopRequireDefault(require("./history.js"));
var _scroll = require("./scroll.js");
var _helper = _interopRequireDefault(require("./helper.js"));
var _handleHistoryChange = _interopRequireDefault(require("./handleHistoryChange.js"));
var _excluded = ["to", "className", "children", "mode", "onMouseEnter", "onMouseLeave", "style"];
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
    mode === "replace" ? _history["default"].replace(to) : _history["default"].push(to);
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
  mode === "replace" ? _history["default"].replace(to) : _history["default"].push(to);
};

// createRouter(routes, store?) => (props) => <Component/>
var createRouter = exports.createRouter = function createRouter(routes, store) {
  return function (props) {
    // prepare routes once
    var preparedRoutesRef = _react["default"].useRef(null);
    if (!preparedRoutesRef.current) {
      preparedRoutesRef.current = _helper["default"].prepare(routes);
    }

    // store is OPTIONAL: fall back to props when absent
    var appState = store ? _react["default"].useContext(store) : {
      state: props || {},
      dispatch: false
    };
    var _ref2 = appState || {},
      _ref2$state = _ref2.state,
      state = _ref2$state === void 0 ? {} : _ref2$state,
      _ref2$dispatch = _ref2.dispatch,
      dispatch = _ref2$dispatch === void 0 ? false : _ref2$dispatch;

    // Only wire effects when we actually have a dispatch function
    _react["default"].useEffect(function () {
      if (!(dispatch && typeof dispatch === "function") || !_history["default"]) return;
      var sync = function sync(_ref3) {
        var location = _ref3.location;
        var nextLoc = location.pathname + (location.search || "");
        dispatch({
          type: "LOCATION_CHANGED",
          location: nextLoc
        });
      };
      var unlisten = _history["default"].listen(sync);

      // initial sync
      dispatch({
        type: "LOCATION_CHANGED",
        location: _history["default"].location.pathname + (_history["default"].location.search || "")
      });
      return function () {
        return unlisten();
      };
    }, [dispatch]);
    _react["default"].useEffect(function () {
      if (!handleSyncRegistered && dispatch && typeof dispatch === "function") {
        (0, _handleHistoryChange["default"])(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);

    // Derive current location from state; otherwise history; otherwise props; otherwise "/"
    var currentLocation = state.location || _history["default"] && _history["default"].location && _history["default"].location.pathname + (_history["default"].location.search || "") || props && props.location || "/";
    var pathOnly = String(currentLocation).split("?", 1)[0];
    var _helper$match = _helper["default"].match(preparedRoutesRef.current, pathOnly),
      Component = _helper$match.Component,
      params = _helper$match.params;
    return /*#__PURE__*/_react["default"].createElement(Component, (0, _extends2["default"])({}, state, {
      params: params,
      dispatch: dispatch
    }));
  };
};
var _default = exports["default"] = {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter
};