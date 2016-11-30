(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.authorizationReducer = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var authorization = function authorization() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
            location: null,
            redirect: null
        };
        var action = arguments[1];


        switch (action.type) {
            default:
                return state;
        }
    };

    exports.default = authorization;
});