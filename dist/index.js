"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _router = require("./router");

var _history = require("./history");

var _helper = _interopRequireDefault(require("./helper"));

module.exports = {
  Link: _router.Link,
  navigate: _router.navigate,
  createRouter: _router.createRouter,
  appHistory: _history.appHistory,
  routesHelper: _helper["default"]
};