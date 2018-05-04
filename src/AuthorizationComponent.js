import React from "react";
import { navigate } from "./router";

class AuthorizationComponent extends React.Component {
  componentDidMount() {
    const token = localStorage.getItem("token");

    if (!token) {
      document.location = this.props.redirect;
      return;
    }

    navigate(this.props.redirect);
  }

  render() {
    return <div className="authorization" />;
  }
}

export default AuthorizationComponent;
