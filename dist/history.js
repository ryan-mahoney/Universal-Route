"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _history = require("history");

// create app history if possible, as singleton
var appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? (0, _history.createBrowserHistory)() : false;
var _default = appHistory;
exports["default"] = _default;