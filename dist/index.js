"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Link", {
  enumerable: true,
  get: function get() {
    return _router.Link;
  }
});
Object.defineProperty(exports, "appHistory", {
  enumerable: true,
  get: function get() {
    return _history.appHistory;
  }
});
Object.defineProperty(exports, "createRouter", {
  enumerable: true,
  get: function get() {
    return _router.createRouter;
  }
});
Object.defineProperty(exports, "makeMemoryHistory", {
  enumerable: true,
  get: function get() {
    return _history.makeMemoryHistory;
  }
});
Object.defineProperty(exports, "navigate", {
  enumerable: true,
  get: function get() {
    return _router.navigate;
  }
});
Object.defineProperty(exports, "routesHelper", {
  enumerable: true,
  get: function get() {
    return _helper["default"];
  }
});
var _router = require("./router.js");
var _history = require("./history.js");
var _helper = _interopRequireDefault(require("./helper.js"));