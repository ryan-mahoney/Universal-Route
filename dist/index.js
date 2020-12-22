"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _router = require("./router");

var _helper = _interopRequireDefault(require("./helper"));

module.exports = {
  Link: _router.Link,
  navigate: _router.navigate,
  createRouter: _router.createRouter,
  routesHelper: _helper["default"]
};