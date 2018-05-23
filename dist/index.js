(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module", "./router", "./helper", "./reducer", "./action"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require("./router"), require("./helper"), require("./reducer"), require("./action"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.router, global.helper, global.reducer, global.action);
    global.index = mod.exports;
  }
})(this, function (module, _router, _helper, _reducer, _action) {
  "use strict";

  var _helper2 = _interopRequireDefault(_helper);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  module.exports = {
    Link: _router.Link,
    navigate: _router.navigate,
    createRouter: _router.createRouter,
    routesHelper: _helper2.default,
    pageReducer: _reducer.reducer,
    routerActions: {
      CHANGE_PAGE: _action.CHANGE_PAGE,
      changePage: _action.changePage
    }
  };
});