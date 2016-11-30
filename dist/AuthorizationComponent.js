(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'react'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('react'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.react);
        global.AuthorizationComponent = mod.exports;
    }
})(this, function (exports, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = _interopRequireDefault(_react);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var AuthorizationComponent = _react2.default.createClass({
        displayName: 'AuthorizationComponent',


        componentDidMount: function componentDidMount() {
            // read token from local storage
            var token = localStorage.getItem('token');

            // validate input
            if (!token) {
                document.location = this.props.redirect;
                return;
            }

            // try with an XHR request
            window.appHistory.push(this.props.location);
        },

        render: function render() {
            return _react2.default.createElement('div', { className: 'authorization' });
        }
    });

    AuthorizationComponent.propTypes = {
        location: _react2.default.PropTypes.string,
        redirect: _react2.default.PropTypes.string
    };

    exports.default = AuthorizationComponent;
});