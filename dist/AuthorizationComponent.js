(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "babel-runtime/core-js/object/get-prototype-of", "babel-runtime/helpers/classCallCheck", "babel-runtime/helpers/createClass", "babel-runtime/helpers/possibleConstructorReturn", "babel-runtime/helpers/inherits", "react", "./router"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("babel-runtime/core-js/object/get-prototype-of"), require("babel-runtime/helpers/classCallCheck"), require("babel-runtime/helpers/createClass"), require("babel-runtime/helpers/possibleConstructorReturn"), require("babel-runtime/helpers/inherits"), require("react"), require("./router"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.getPrototypeOf, global.classCallCheck, global.createClass, global.possibleConstructorReturn, global.inherits, global.react, global.router);
    global.AuthorizationComponent = mod.exports;
  }
})(this, function (exports, _getPrototypeOf, _classCallCheck2, _createClass2, _possibleConstructorReturn2, _inherits2, _react, _router) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

  var _createClass3 = _interopRequireDefault(_createClass2);

  var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

  var _inherits3 = _interopRequireDefault(_inherits2);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var AuthorizationComponent = function (_React$Component) {
    (0, _inherits3.default)(AuthorizationComponent, _React$Component);

    function AuthorizationComponent() {
      (0, _classCallCheck3.default)(this, AuthorizationComponent);
      return (0, _possibleConstructorReturn3.default)(this, (AuthorizationComponent.__proto__ || (0, _getPrototypeOf2.default)(AuthorizationComponent)).apply(this, arguments));
    }

    (0, _createClass3.default)(AuthorizationComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var token = localStorage.getItem("token");

        if (!token) {
          document.location = this.props.redirect;
          return;
        }

        (0, _router.navigate)(this.props.redirect);
      }
    }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement("div", { className: "authorization" });
      }
    }]);
    return AuthorizationComponent;
  }(_react2.default.Component);

  exports.default = AuthorizationComponent;
});