(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './router.js', './helper.js', './reducer.js', './action.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./router.js'), require('./helper.js'), require('./reducer.js'), require('./action.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.router, global.helper, global.reducer, global.action);
    global.index = mod.exports;
  }
})(this, function (module, _router, _helper, _reducer, _action) {
  'use strict';

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
    helper: _helper2.default,
    pageReducer: _reducer.pageReducer,
    actions: { CHANGE_PAGE: _action.CHANGE_PAGE, CHANGE_PAGE_ERROR: _action.CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH: _action.CHANGE_PAGE_AUTH, changePage: _action.changePage, changePageError: _action.changePageError, changePageAuth: _action.changePageAuth }
  };
});