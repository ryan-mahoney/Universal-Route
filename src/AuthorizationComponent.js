import React from 'react';
import createReactClass from 'create-react-class';
import { navigate } from './router.js';

const AuthorizationComponent = createReactClass({

  componentDidMount: function () {
    // read token from local storage
    const token = localStorage.getItem('token');

    // validate input
    if (!token) {
      document.location = this.props.redirect;
      return;
    }

    navigate(this.props.redirect);
  },

  render: function () {
    return (<div className="authorization"></div>);
  }
});

export default AuthorizationComponent;
