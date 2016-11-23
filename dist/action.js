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

    var changeHistory = exports.changeHistory = function changeHistory(response) {
        return {
            type: CHANGE_HISTORY,
            payload: response
        };
    };
});