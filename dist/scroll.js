"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setScrollToSessionStorage = exports.setScrollForKey = exports.getScrollPosition = exports.getScrollFromSessionStorage = void 0;
// Centralized scroll helpers with query-aware keys
var SCROLL_KEY = "scroll";
var getScrollPosition = exports.getScrollPosition = function getScrollPosition() {
  return {
    y: window.pageYOffset || document.documentElement.scrollTop || 0,
    x: window.pageXOffset || document.documentElement.scrollLeft || 0
  };
};
var currentKey = function currentKey() {
  var _window$location = window.location,
    pathname = _window$location.pathname,
    search = _window$location.search;
  return "".concat(pathname).concat(search || "");
};
var readStore = function readStore() {
  if (typeof sessionStorage === "undefined") return {};
  try {
    var blob = sessionStorage.getItem(SCROLL_KEY);
    return blob ? JSON.parse(blob) : {};
  } catch (_unused) {
    return {};
  }
};
var writeStore = function writeStore(obj) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch (_unused2) {
    /* ignore quota/security errors */
  }
};
var setScrollToSessionStorage = exports.setScrollToSessionStorage = function setScrollToSessionStorage() {
  var store = readStore();
  store[currentKey()] = getScrollPosition();
  writeStore(store);
};
var setScrollForKey = exports.setScrollForKey = function setScrollForKey(key, pos) {
  var store = readStore();
  store[key] = pos || getScrollPosition();
  writeStore(store);
};
var getScrollFromSessionStorage = exports.getScrollFromSessionStorage = function getScrollFromSessionStorage() {
  var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
  var store = readStore();
  if (key === "*") return store;
  return store[key] || null;
};