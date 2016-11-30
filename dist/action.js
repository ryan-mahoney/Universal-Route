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
    var CHANGE_HISTORY = exports.CHANGE_HISTORY = 'CHANGE_HISTORY';
    var CHANGE_HISTORY_ERROR = exports.CHANGE_HISTORY_ERROR = 'CHANGE_HISTORY_ERROR';

    var changeHistory = exports.changeHistory = function changeHistory(response) {
        return {
            type: CHANGE_HISTORY,
            payload: response
        };
    };

    var changeHistoryError = exports.changeHistoryError = function changeHistoryError(error) {
        return {
            type: CHANGE_HISTORY_ERROR,
            payload: error
        };
    };
});