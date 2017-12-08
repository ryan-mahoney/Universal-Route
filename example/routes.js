// NPM dependencies
import React from 'react';
import helper from './../src/helper.js';

// React component dependencies
import Home from './components/Home.js';
import About from './components/About.js';
import NotAuthorized from './components/NotAuthorized.js';
import Error from './components/Error.js'

// associate paths to components
const routes = {
  '/':                    Home,
  '/about':               About,
  '/notauthorized':       NotAuthorized,
  '/error':               Error,
  'blank':                Home
};

// export the routes after prepating them
export default helper.prepare(routes);
