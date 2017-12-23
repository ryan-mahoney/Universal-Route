(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.action = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var CHANGE_PAGE = exports.CHANGE_PAGE = "CHANGE_PAGE";

  var changePage = exports.changePage = function changePage(data) {
    return {
      type: CHANGE_PAGE,
      data: data
    };
  };
});