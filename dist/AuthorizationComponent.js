(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'react', 'create-react-class', './router.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('react'), require('create-react-class'), require('./router.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react, global.createReactClass, global.router);
    global.AuthorizationComponent = mod.exports;
  }
})(this, function (exports, _react, _createReactClass, _router) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  var _createReactClass2 = _interopRequireDefault(_createReactClass);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var AuthorizationComponent = (0, _createReactClass2.default)({
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
      (0, _router.navigate)(this.props.location);
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