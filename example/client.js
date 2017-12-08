import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { createRouter } from './../src/router.js';
import * as actions from './../src/action.js';

// read routes
import routes from './routes.js';

// load up a react 404 component
import PageNotFound from './components/PageNotFound.js';

// initialize the router
const Router = createRouter(routes, actions, PageNotFound);

// preload the store
const preloadedState = window.__PRELOADED_STATE__ || {};
const store = configureStore(preloadedState);
const rootElement = document.getElementById('app');

// render the application
render(
  <Provider store={store}>
    <Router location={window.location.pathname} />
  </Provider>,
  rootElement
);
