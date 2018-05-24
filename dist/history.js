(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "history/createBrowserHistory"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("history/createBrowserHistory"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.createBrowserHistory);
    global.history = mod.exports;
  }
})(this, function (exports, _createBrowserHistory) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  // create app history if possible, as singleton
  var appHistory = typeof window !== "undefined" && window.document && window.document.createElement ? (0, _createBrowserHistory2.default)() : false;

  exports.default = appHistory;
});