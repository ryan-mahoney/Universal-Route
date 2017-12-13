(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./action.js"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./action.js"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.action);
    global.reducer = mod.exports;
  }
})(this, function (exports, _action) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.reducer = undefined;
  var reducer = exports.reducer = function reducer() {
    var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { location: "/", error: null };
    var action = arguments[1];

    switch (action.type) {
      case _action.CHANGE_PAGE:
        return action.data;

      default:
        return currentState;
    }
  };
});