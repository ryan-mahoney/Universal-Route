"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports["default"] = exports.createRouter = exports.Link = void 0;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
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

/**
 * API: createRouter(routes, storeContext) => RouterComponent
 * A store is REQUIRED. There is no store-less mode.
 */
var createRouter = exports.createRouter = function createRouter(routes, store) {
  if (!store) {
    throw new Error("createRouter(routes, store): a store/context is required. Wrap your app with a Provider that supplies {state, dispatch}.");
  }
  var Router = function Router() {
    // Prepare routes once
    var preparedRoutesRef = _react["default"].useRef(null);
    if (!preparedRoutesRef.current) {
      preparedRoutesRef.current = _helper["default"].prepare(routes);
    }

    // Pull state/dispatch from required store
    var appState = _react["default"].useContext(store);
    if (!appState || (0, _typeof2["default"])(appState) !== "object" || !("state" in appState) || typeof appState.dispatch !== "function") {
      throw new Error("Router: expected context value {state, dispatch}. Ensure your <StateProvider> supplies both.");
    }
    var state = appState.state,
      dispatch = appState.dispatch;

    // Sync history -> store
    _react["default"].useEffect(function () {
      if (!dispatch || !_history["default"]) return;
      var unlisten = _history["default"].listen(function (_ref2) {
        var location = _ref2.location;
        var nextLoc = location.pathname + (location.search || "");
        dispatch({
          type: "LOCATION_CHANGED",
          location: nextLoc
        });
      });

      // initial sync (hydrate if state.location is missing or stale)
      dispatch({
        type: "LOCATION_CHANGED",
        location: _history["default"].location.pathname + (_history["default"].location.search || "")
      });
      return function () {
        return unlisten();
      };
    }, [dispatch]);

    // Register network/side-effect sync once (per app shell)
    _react["default"].useEffect(function () {
      if (!handleSyncRegistered && dispatch) {
        (0, _handleHistoryChange["default"])(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);

    // Location is sourced ONLY from store
    var currentLocation = state.location || "/";
    var pathOnly = currentLocation.split("?", 1)[0];
    var _helper$match = _helper["default"].match(preparedRoutesRef.current, pathOnly),
      Component = _helper$match.Component,
      params = _helper$match.params;
    return /*#__PURE__*/_react["default"].createElement(Component, (0, _extends2["default"])({}, state, {
      params: params,
      dispatch: dispatch
    }));
  };
  return Router;
};
var _default = exports["default"] = {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter
};