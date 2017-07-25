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
  exports.pageReducer = undefined;

  var _assign2 = _interopRequireDefault(_assign);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var pageReducer = exports.pageReducer = function pageReducer() {
    var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
      case CHANGE_PAGE:
        return (0, _assign2.default)({}, currentState, { page: action.payload });
      case CHANGE_PAGE_ERROR:
        return (0, _assign2.default)({}, currentState, { error: action.error });
      default:
        return currentState;
    }
  };
});