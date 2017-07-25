import Express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
const app = Express();
const port = 8000;

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import configureStore from './store/configureStore.js';

import { createRouter } from './../src/router.js';
import routes from './routes.js';
import PageNotFound from './components/PageNotFound.js';
import Error from './components/Error.js';

// initialize the router
const Router = createRouter(routes, {}, PageNotFound, Error);

function handleRender(req, res) {

  if (req.xhr) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({mode: 'xhr'}));
    return;
  }

  // create a new redux store instance
  const store = configureStore({page: {mode: 'server'}});

  // render the component to a string
  const html = renderToString(
    <Provider store={store}>
      <Router location={req.originalUrl} />
    </Provider>
  );

  // Grab the initial state from our Redux store
  const finalState = store.getState();

  // Send the rendered page back to the client
  res.send(render(html, finalState));
}

app.get('/favicon.ico', (req, res) => { res.send(""); });

app.get('/client-build.js', (req, res) => {
  res.send(fs.readFileSync(`./client-build.js`, 'utf8'));
});

app.get('/bad', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(500).send(JSON.stringify({error: 'Something bad happened.'}));
});

app.get('/needauth', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({authorization: {
    redirect: '/notauthorized',
    location: '/needauth'
  }}));
});

// catch all requests
app.use(handleRender);

function render(html, state) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Application</title>
        <link rel="shortcut icon" href="" type="image/x-icon" />
      </head>
      <body>
        <div id="app">${html}</div>
        <script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\x3c')}</script>
        <script src="/client-build.js"></script>
      </body>
    </html>`
}

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
  }
});
