import React from 'react';

const AuthorizationComponent = React.createClass({

    componentDidMount: function () {
        // read token from local storage
        const token = localStorage.getItem('token');

        // validate input
        if (!token) {
            document.location = this.props.redirect;
            return;
        }

        // try with an XHR request
        window.appHistory.push(this.props.location);
    },

    render: function () {
        return (
            <div className="authorization"></div>
        );
    }
});

AuthorizationComponent.propTypes = {
    location: React.PropTypes.string,
    redirect: React.PropTypes.string
};

export default AuthorizationComponent;
