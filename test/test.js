import React from "react";
import assert from "assert";
import * as enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
enzyme.configure({ adapter: new Adapter() });
import { createRouter } from "./../src/router.js";
import routes from "./../example/routes.js";

const { JSDOM } = require("jsdom");

const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://localhost/",
});
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: "node.js",
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);

describe("Router test", () => {
  it("displays the home page", () => {
    const Router = createRouter(routes);

    const wrapper = enzyme.mount(<Router page={{ location: "/" }} />);

    assert(wrapper.contains(<h1>Home</h1>) === true);

    //wrapper.find("#about").simulate("click");
  });
});
