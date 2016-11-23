(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'redux', './action.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('redux'), require('./action.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.redux, global.action);
        global.reducer = mod.exports;
    }
})(this, function (exports, _redux, _action) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (reducers) {

        var subReducers = (0, _redux.combineReducers)(reducers);

        return function () {
            var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
            var action = arguments[1];

            var nextState = globalReducer(currentState, action);
            if (action.type == _action.CHANGE_HISTORY) {
                return nextState;
            }
            return subReducers(nextState, action);
        };
    };

    var globalReducer = function globalReducer() {
        var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];

        switch (action.type) {
            case _action.CHANGE_HISTORY:
                return Object.assign({}, currentState, action.payload);
            default:
                return currentState;
        }
    };

    ;
});