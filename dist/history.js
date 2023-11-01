"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.appHistory = void 0;
var _history = require("history");
// create app history if possible, as singleton
var appHistory = exports.appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? (0, _history.createBrowserHistory)() : false;
var _default = exports["default"] = appHistory;