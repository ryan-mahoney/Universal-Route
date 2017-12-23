import React from "react";
import {navigate} from "./router.js";

class AuthorizationComponent extends React.Component {
  componentDidMount() {
    // read token from local storage
    const token = localStorage.getItem("token");

    // validate input
    if (!token) {
      document.location = this.props.redirect;
      return;
    }

    navigate(this.props.redirect);
  }

  render () {
    return (<div className="authorization"></div>);
  }
}

export default AuthorizationComponent;
