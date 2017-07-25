import React from 'react';
import { Link } from './../../src/router.js';

const Home = (props) => {
  return (
    <div>
      <h1>Home</h1>
      <div>Render Mode: {props.mode}</div>
      <div>
        <Link to="/about">About</Link>
      </div>
      <div>
        <Link to="/x">Unknown</Link>
      </div>
      <div>
        <Link to="/bad">Error</Link>
      </div>
      <div>
        <Link to="/needauth">Requires Authorization</Link>
      </div>
    </div>
  )
};

export default Home;
