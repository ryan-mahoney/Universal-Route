import 'jsdom-global/register';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
import assert from 'assert';

import { Provider } from 'react-redux';
import configureStore from './../example/store/configureStore';
import { createRouter } from './../src/router.js';
import * as actions from './../src/action.js';
import routes from './../example/routes.js';
import PageNotFound from './../example/components/PageNotFound.js';
import Error from './../example/components/Error.js';

describe('Router test', function () {
  it ('displays the home page', function () {

    // initialize the router
    const Router = createRouter(routes, actions, PageNotFound, Error);

    // preload the store
    const store = configureStore({});

    var tree = ReactTestUtils.renderIntoDocument(
      <Provider store={store}>
        <Router location="/" />
      </Provider>
    );
    var rendered = ReactDOM.findDOMNode(tree);

    let h1 = rendered.querySelectorAll("h1");

    assert.equal(h1[0].textContent, 'Home');
  });
});
