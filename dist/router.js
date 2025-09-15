"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports["default"] = exports.createRouter = exports.Link = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _history = _interopRequireDefault(require("./history.js"));
var _helper = _interopRequireDefault(require("./helper.js"));
var _excluded = ["to", "replace", "state", "onClick"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/** Programmatic navigation helper */
var navigate = exports.navigate = function navigate(to) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$replace = _ref.replace,
    replace = _ref$replace === void 0 ? false : _ref$replace,
    state = _ref.state;
  if (replace) _history["default"].replace(to, state);else _history["default"].push(to, state);
};

/** Tiny <Link> that routes via shared history without full page reloads. */
var Link = exports.Link = function Link(_ref2) {
  var to = _ref2.to,
    _ref2$replace = _ref2.replace,
    replace = _ref2$replace === void 0 ? false : _ref2$replace,
    state = _ref2.state,
    onClick = _ref2.onClick,
    rest = (0, _objectWithoutProperties2["default"])(_ref2, _excluded);
  var handleClick = function handleClick(e) {
    if (onClick) onClick(e);
    if (e.defaultPrevented || e.button !== 0 ||
    // left click
    e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    if (replace) _history["default"].replace(to, state);else _history["default"].push(to, state);
  };
  return /*#__PURE__*/_react["default"].createElement("a", (0, _extends2["default"])({
    href: typeof to === "string" ? to : (to === null || to === void 0 ? void 0 : to.pathname) || "#",
    onClick: handleClick
  }, rest));
};

/**
 * createRouter(routes, storeContext?) => <Router />
 *
 * - If a store context is provided, the router will use {state, dispatch} from it.
 * - If no store context is provided, props are treated as state and dispatch=false.
 * - Assumes initial store already has the current location; DOES NOT dispatch on mount.
 * - Listens to history and dispatches LOCATION_CHANGED only when location truly changes.
 */
var createRouter = exports.createRouter = function createRouter(routes, storeContext) {
  return function (props) {
    var _history$location, _history$location2;
    var appState = storeContext ? (0, _react.useContext)(storeContext) : {
      state: props,
      dispatch: false
    };
    var _ref3 = appState || {},
      state = _ref3.state,
      dispatch = _ref3.dispatch;

    // Prepare routes with regex matchers
    var preparedRoutes = (0, _react.useMemo)(function () {
      return _helper["default"].prepare(routes);
    }, [routes]);
    var currentFromHistory = ((_history["default"] === null || _history["default"] === void 0 || (_history$location = _history["default"].location) === null || _history$location === void 0 ? void 0 : _history$location.pathname) || "") + ((_history["default"] === null || _history["default"] === void 0 || (_history$location2 = _history["default"].location) === null || _history$location2 === void 0 ? void 0 : _history$location2.search) || "");
    var initialLocation = state && state.location || currentFromHistory;

    // Track last known full location string (path + search)
    var lastLocRef = (0, _react.useRef)(initialLocation);

    // Keep local state so the component re-renders on navigation
    var _useState = (0, _react.useState)(initialLocation),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      loc = _useState2[0],
      setLoc = _useState2[1];
    (0, _react.useEffect)(function () {
      if (!_history["default"] || typeof _history["default"].listen !== "function") return;
      var unlisten = _history["default"].listen(function (_ref4) {
        var location = _ref4.location,
          action = _ref4.action;
        var nextLoc = (location.pathname || "") + (location.search || "");
        if (nextLoc !== lastLocRef.current) {
          lastLocRef.current = nextLoc;
          setLoc(nextLoc); // trigger re-render
          if (typeof dispatch === "function") {
            dispatch({
              type: "LOCATION_CHANGED",
              location: nextLoc,
              meta: {
                action: action
              }
            });
          }
        }
      });
      return function () {
        if (typeof unlisten === "function") unlisten();
      };
    }, [dispatch]);
    var activePathname = (loc || "").split("?")[0];

    // Use helper.match instead of the broken matchRoute function
    var matched = (0, _react.useMemo)(function () {
      return _helper["default"].match(preparedRoutes, activePathname);
    }, [preparedRoutes, activePathname]);
    var Component = (matched === null || matched === void 0 ? void 0 : matched.Component) || function () {
      return null;
    };
    return /*#__PURE__*/_react["default"].createElement(Component, (0, _extends2["default"])({}, state, matched.params, {
      dispatch: dispatch
    }));
  };
};
var _default = exports["default"] = createRouter;