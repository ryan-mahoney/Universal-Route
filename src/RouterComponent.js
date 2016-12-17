
// peer dependencies
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import reqwest from 'reqwest';
import nprogress from 'nprogress';
import Guid from 'guid';

// local dependencies
import helper from './helper.js';

// expects all historyObj, Routes, Actions and a 404 React component to be passed in
export default function (historyObj, Routes, Actions, Unknown) {

    function mapDispatchToProps(dispatch) {
        return bindActionCreators(Actions, dispatch);
    }

    const mapStateToProps = function (state) {
        return state;
    };

    return connect(mapStateToProps, mapDispatchToProps)(React.createClass({

        getInitialState: function () {

            // if an init function was specified as a property, call it
            if ('init' in this.props) {
                this.props.init();
            }

            return {};
        },

        handleUnlisten: function () {},

        componentWillMount: function () {
            // handle server case
            if (!historyObj) {
                return;
            }

            // listen for changes to the current location
            this.handleUnlisten = historyObj.listen(function (location, action) {

                // decide which path to call
                var path;
                const guid = Guid.raw();
                if (location.pathname.indexOf('?') !== -1) {
                    path = location.pathname + '&guid=' + guid;
                } else {
                    path = location.pathname + '?guid=' + guid;
                }

                // clear and start
                nprogress.done();
                nprogress.start();

                // do XHR request
                reqwest({
                    method: 'get',
                    url: path,
                    type: 'json',
                    contentType: 'application/json',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(function (response) {

                    // handle authorization based redirection
                    if (response.authorization) {
                        nprogress.done();
                        historyObj.push(response.authorization.redirect);
                        return;
                    }

                    // update store
                    response.location = location.pathname;
                    this.props.changeHistory(response);
                    nprogress.done();

                }.bind(this), function (err, msg) {
                    this.props.changeHistoryError({err, msg});
                    nprogress.done();
                }.bind(this));

            }.bind(this));
        },

        componentWillUnmount: function () {
            this.handleUnlisten();
        },

        render: function () {

            // get the component from the router
            var route = helper.match(Routes, this.props.location, Unknown);
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
            return (<Component {...props} />);
        }
    }));
}
