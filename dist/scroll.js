(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "babel-runtime/core-js/object/assign", "babel-runtime/core-js/json/stringify"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("babel-runtime/core-js/object/assign"), require("babel-runtime/core-js/json/stringify"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.assign, global.stringify);
    global.scroll = mod.exports;
  }
})(this, function (exports, _assign, _stringify) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getScrollFromSessionStorage = exports.setScrollToSessionStorage = exports.getScrollPosition = undefined;

  var _assign2 = _interopRequireDefault(_assign);

  var _stringify2 = _interopRequireDefault(_stringify);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var getScrollPosition = exports.getScrollPosition = function getScrollPosition() {
    return {
      y: window.pageYOffset || document.documentElement.scrollTop,
      x: window.pageXOffset || document.documentElement.scrollLeft
    };
  };

  var setScrollToSessionStorage = exports.setScrollToSessionStorage = function setScrollToSessionStorage() {
    var path = window.location.pathname;
    var data = (0, _stringify2.default)((0, _assign2.default)({}, getScrollFromSessionStorage("*") || {}, {
      path: getScrollPosition()
    }));
    sessionStorage.setItem("scroll", data);
  };

  var getScrollFromSessionStorage = exports.getScrollFromSessionStorage = function getScrollFromSessionStorage(url) {
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
});