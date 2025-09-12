"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMemoryHistory = exports["default"] = exports.appHistory = void 0;
var _history = require("history");
// Modernized history singleton with test-friendly exports (ESM)

var appHistory = exports.appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? (0, _history.createBrowserHistory)() : null;
var makeMemoryHistory = exports.makeMemoryHistory = function makeMemoryHistory() {
  var initialEntries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ["/"];
  return (0, _history.createMemoryHistory)({
    initialEntries: initialEntries
  });
};
var _default = exports["default"] = appHistory;