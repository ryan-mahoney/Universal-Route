import "jsdom-global/register";
import React from "react";
import assert from "assert";
import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
enzyme.configure({ adapter: new Adapter() });

import { Provider } from "react-redux";
import configureStore from "./../example/store/configureStore";
import { createRouter } from "./../src/router.js";
import routes from "./../example/routes.js";

describe("Router test", () => {
  it("displays the home page", () => {
    // initialize the router
    const Router = createRouter(routes);

    // preload the store
    const store = configureStore({});

    const wrapper = enzyme.mount(
      <Provider store={store}>
        <Router location="/" />
      </Provider>
    );

    assert(wrapper.contains(<h1>Home</h1>) === true);
  });
});
