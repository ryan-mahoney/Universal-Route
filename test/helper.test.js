import routesHelper from "../src/helper.js";
import React from "react";
import { render, screen } from "@testing-library/react";

const Dummy = () => null;

describe("helper.js", () => {
  test("prepare() converts a map to prepared routes with matchers", () => {
    const routes = {
      "/": Dummy,
      "/users/:id": [Dummy, "users"],
    };
    const prepared = routesHelper.prepare(routes);
    expect(Array.isArray(prepared)).toBe(true);
    expect(prepared).toHaveLength(2);
    const users = prepared.find((r) => r.path === "/users/:id");
    expect(users).toBeTruthy();
    expect(typeof users.matcher).toBe("function");
    expect(users.reducerKey).toBe("users");
  });

  test("match() finds matching component and params", () => {
    const routes = {
      "/": Dummy,
      "/users/:id": [Dummy, "users"],
    };
    const prepared = routesHelper.prepare(routes);
    const { Component, params, reducerKey } = routesHelper.match(
      prepared,
      "/users/42"
    );
    expect(Component).toBe(Dummy);
    expect(reducerKey).toBe("users");
    expect(params).toEqual({ id: "42" });
  });

  test("match() returns Generic404 when nothing matches", () => {
    const routes = {
      "/": Dummy,
    };
    const prepared = routesHelper.prepare(routes);
    const { Component } = routesHelper.match(prepared, "/nope");
    // We can't import Generic404 directly; assert it renders expected text.
    // Render and check for the "404" text.
    render(React.createElement(Component));
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
