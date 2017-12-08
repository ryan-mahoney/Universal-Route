import React from 'react';

const Error = (props) => (
  <div>
    <h1>Error</h1>
    <div>{props.page.error}</div>
  </div>
);

export default Error;
