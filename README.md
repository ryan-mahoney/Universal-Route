Universal Route
===============
Universal Router is a small routing library for React.

A Router keeps your UI in sync with the URL. Universal Router is small because it is covers a specific use case.

- associate [URL patterns](https://github.com/pillarjs/path-to-regexp) with a top-level React component
- make an XHR request on each history transition, switch displayed component after success
- start / stop progress page loading indicator

### Defining Routes
routes.js
```javascript
// NPM dependencies
import React from 'react';
import { helper } from '@ryanfw/universal-route';

// React component dependencies
import Home from './components/Home.js';
import About from './components/About.js';
import Staff from './components/Staff.js';

// associate paths to components
const routes = {
  '/':                    Home,
  '/about':               About,
  '/staff/:name':         Staff
};

// export the routes after prepating them
export default helper.prepare(routes);
```
