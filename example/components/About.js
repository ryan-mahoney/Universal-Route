import React from 'react';
import { navigate } from './../../src/router.js';

const About = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div>
      <h1>About</h1>
      <div>Render Mode: {props.mode}</div>
      <div>
        <a href="#" onClick={handleClick}>Home</a>
      </div>
    </div>
   );
};

export default About;
