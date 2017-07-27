(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'babel-runtime/core-js/object/assign', './action.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('babel-runtime/core-js/object/assign'), require('./action.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.assign, global.action);
    global.reducer = mod.exports;
  }
})(this, function (exports, _assign, _action) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.reducer = undefined;

  var _assign2 = _interopRequireDefault(_assign);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var reducer = exports.reducer = function reducer() {
    var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    switch (action.type) {
      case _action.CHANGE_PAGE:
        return (0, _assign2.default)({}, currentState, {
          page: action.page,
          error: null,
          auth: null
        });

      case _action.CHANGE_PAGE_ERROR:
        return (0, _assign2.default)({}, currentState, {
          page: null,
          error: action.error,
          auth: null
        });

      case _action.CHANGE_PAGE_AUTH:
        return (0, _assign2.default)({}, currentState, {
          page: null,
          error: null,
          auth: action.auth
        });

      default:
        return currentState;
    }
  };
});