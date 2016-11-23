(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'react', 'redux', 'react-redux', 'reqwest', 'nprogress', 'guid', './helper.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('react'), require('redux'), require('react-redux'), require('reqwest'), require('nprogress'), require('guid'), require('./helper.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.react, global.redux, global.reactRedux, global.reqwest, global.nprogress, global.guid, global.helper);
        global.component = mod.exports;
    }
})(this, function (exports, _react, _redux, _reactRedux, _reqwest, _nprogress, _guid, _helper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (historyObj, Routes, Actions, Unknown) {

        function mapDispatchToProps(dispatch) {
            return (0, _redux.bindActionCreators)(Actions, dispatch);
        }

        var mapStateToProps = function mapStateToProps(state) {
            return state;
        };

        return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_react2.default.createClass({

            handleUnlisten: function handleUnlisten() {},

            componentDidMount: function componentDidMount() {
                // listen for changes to the current location
                this.handleUnlisten = historyObj.listen(function (location, action) {

                    // decide which path to call
                    var path;
                    var guid = _guid2.default.raw();
                    if (location.pathname.indexOf('?') !== -1) {
                        path = location.pathname + '&guid=' + guid;
                    } else {
                        path = location.pathname + '?guid=' + guid;
                    }

                    // clear and start
                    _nprogress2.default.done();
                    _nprogress2.default.start();

                    // do XHR request
                    (0, _reqwest2.default)({
                        method: 'get',
                        url: path,
                        type: 'json',
                        contentType: 'application/json',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }).then(function (response) {

                        // update store
                        response.location = location.pathname;
                        this.props.changeHistory(response);
                        _nprogress2.default.done();
                    }.bind(this), function (err, msg) {
                        console.log('XHR ERROR');
                        console.log(err);
                        this.props.changeHistory({ location: location.pathname });
                        _nprogress2.default.done();
                    }.bind(this));
                }.bind(this));
            },

            componentWillUnmount: function componentWillUnmount() {
                this.handleUnlisten();
            },

            render: function render() {

                // get the component from the router
                var route = _helper2.default.match(Routes, this.props.location, Unknown);
                var Component = route.component;

                // we may not send all the props, depending if there is a reducerKey
                var props = {};
                if (route.reducerKey) {
                    // include all the action functions
                    Object.keys(this.props).map(function (propKey) {
                        // if it is a function, must be a redux action function
                        if (Object.prototype.toString.call(this.props[propKey]) === '[object Function]') {
                            props[propKey] = this.props[propKey];
                        }
                    }.bind(this));

                    // put the reducerKey properties at the top of the props, ignore other keys
                    Object.keys(this.props[route.reducerKey]).map(function (prop) {
                        props[prop] = this.props[route.reducerKey][prop];
                    }.bind(this));
                } else {
                    // send all the props
                    props = Object.assign(props, this.props, {});
                }

                // return the component from the router with the appropriate props
                return _react2.default.createElement(Component, props);
            }
        }));
    };

    var _react2 = _interopRequireDefault(_react);

    var _reqwest2 = _interopRequireDefault(_reqwest);

    var _nprogress2 = _interopRequireDefault(_nprogress);

    var _guid2 = _interopRequireDefault(_guid);

    var _helper2 = _interopRequireDefault(_helper);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
});