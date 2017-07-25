(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './RouterComponent.js', './AuthorizationComponent.js', './helper.js', './reducer.js', './action.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./RouterComponent.js'), require('./AuthorizationComponent.js'), require('./helper.js'), require('./reducer.js'), require('./action.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.RouterComponent, global.AuthorizationComponent, global.helper, global.reducer, global.action);
        global.index = mod.exports;
    }
})(this, function (exports, _RouterComponent, _AuthorizationComponent, _helper, _reducer, _action) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.actions = exports.reducer = exports.helper = exports.AuthorizationComponent = exports.RouterComponent = undefined;

    var _RouterComponent2 = _interopRequireDefault(_RouterComponent);

    var _AuthorizationComponent2 = _interopRequireDefault(_AuthorizationComponent);

    var _helper2 = _interopRequireDefault(_helper);

    var _reducer2 = _interopRequireDefault(_reducer);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var actions = {
        CHANGE_HISTORY: CHANGE_HISTORY,
        changeHistory: changeHistory,
        CHANGE_HISTORY_ERROR: CHANGE_HISTORY_ERROR,
        changeHistoryError: changeHistoryError
    };

    exports.RouterComponent = _RouterComponent2.default;
    exports.AuthorizationComponent = _AuthorizationComponent2.default;
    exports.helper = _helper2.default;
    exports.reducer = _reducer2.default;
    exports.actions = actions;
});