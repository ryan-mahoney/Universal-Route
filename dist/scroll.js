"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setScrollToSessionStorage = exports.getScrollPosition = exports.getScrollFromSessionStorage = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var getScrollPosition = function getScrollPosition() {
  return {
    y: window.pageYOffset || document.documentElement.scrollTop,
    x: window.pageXOffset || document.documentElement.scrollLeft
  };
};

exports.getScrollPosition = getScrollPosition;

var setScrollToSessionStorage = function setScrollToSessionStorage() {
  return typeof sessionStorage === "undefined" ? "{}" : sessionStorage.setItem("scroll", JSON.stringify(Object.assign({}, getScrollFromSessionStorage("*") || {}, (0, _defineProperty2["default"])({}, window.location.pathname, getScrollPosition()))));
};

exports.setScrollToSessionStorage = setScrollToSessionStorage;

var getScrollFromSessionStorage = function getScrollFromSessionStorage(url) {
  if (typeof sessionStorage === "undefined") return null;
  var blob = sessionStorage.getItem("scroll");

  if (!blob) {
    return null;
  }

  var data = JSON.parse(blob);

  if (url == "*") {
    return data;
  }

  return data[url] || null;
};

exports.getScrollFromSessionStorage = getScrollFromSessionStorage;