(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
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
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var CHANGE_PAGE = exports.CHANGE_PAGE = 'CHANGE_PAGE';
  var CHANGE_PAGE_ERROR = exports.CHANGE_PAGE_ERROR = 'CHANGE_PAGE_ERROR';

  var changePage = exports.changePage = function changePage(page) {
    return {
      type: CHANGE_PAGE,
      payload: page.payload,
      location: page.location
    };
  };

  var changePageError = exports.changePageError = function changePageError(error) {
    return {
      type: CHANGE_PAGE_ERROR,
      error: error,
      location: '/error'
    };
  };
});