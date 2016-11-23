(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'babel-runtime/core-js/object/assign', 'redux', './action.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('babel-runtime/core-js/object/assign'), require('redux'), require('./action.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.assign, global.redux, global.action);
        global.reducer = mod.exports;
    }
})(this, function (exports, _assign, _redux, _action) {
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

    var _assign2 = _interopRequireDefault(_assign);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var globalReducer = function globalReducer() {
        var currentState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];

        switch (action.type) {
            case _action.CHANGE_HISTORY:
                return (0, _assign2.default)({}, currentState, action.payload);
            default:
                return currentState;
        }
    };

    ;
});