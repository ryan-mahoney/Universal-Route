import routesHelper from "../src/helper";
import React from "react";
import { render, screen } from "@testing-library/react";

const Dummy = () => null;

describe("helper.js", () => {
  test("prepare() normalizes array route object form", () => {
    const prepared = routesHelper.prepare([
      { path: "/x", element: Dummy, reducerKey: "slice" },
    ]);

    expect(prepared).toHaveLength(1);
    expect(prepared[0]).toEqual(
      expect.objectContaining({
        path: "/x",
        Component: Dummy,
        reducerKey: "slice",
      })
    );
    expect(typeof prepared[0].matcher).toBe("function");
  });

  test("prepare() normalizes object map route form", () => {
    const prepared = routesHelper.prepare({
      "/x": { Component: Dummy, reducerKey: "slice" },
    });

    expect(prepared).toHaveLength(1);
    expect(prepared[0]).toEqual(
      expect.objectContaining({
        path: "/x",
        Component: Dummy,
        reducerKey: "slice",
      })
    );
    expect(typeof prepared[0].matcher).toBe("function");
  });

  test("prepare() supports object map route form with element", () => {
    const prepared = routesHelper.prepare({
      "/x": { element: Dummy, reducerKey: "slice" },
    });

    expect(prepared).toHaveLength(1);
    expect(prepared[0]).toEqual(
      expect.objectContaining({
        path: "/x",
        Component: Dummy,
        reducerKey: "slice",
      })
    );
    expect(typeof prepared[0].matcher).toBe("function");
  });

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

  test("match() wildcard behavior respects route order and supports '*' and '/*'", () => {
    const Specific = () => null;
    const Star = () => null;
    const SlashStar = () => null;

    const specificFirst = routesHelper.prepare([
      { path: "/users/:id", element: Specific },
      { path: "*", element: Star },
    ]);
    const wildcardFirst = routesHelper.prepare([
      { path: "*", element: Star },
      { path: "/users/:id", element: Specific },
    ]);
    const slashStar = routesHelper.prepare([{ path: "/*", element: SlashStar }]);

    expect(routesHelper.match(specificFirst, "/users/7").Component).toBe(Specific);
    expect(routesHelper.match(wildcardFirst, "/users/7").Component).toBe(Star);
    expect(routesHelper.match(slashStar, "/anything").Component).toBe(SlashStar);
  });

  test("match() decodes URL-encoded dynamic params", () => {
    const prepared = routesHelper.prepare([{ path: "/users/:name", element: Dummy }]);
    const { params } = routesHelper.match(prepared, "/users/jane%20doe");
    expect(params).toEqual({ name: "jane doe" });
  });

  test("match() does not throw on malformed URI params", () => {
    const prepared = routesHelper.prepare([{ path: "/users/:name", element: Dummy }]);
    expect(() => routesHelper.match(prepared, "/users/%E0%A4%A")).not.toThrow();
    expect(routesHelper.match(prepared, "/users/%E0%A4%A").params).toEqual({
      name: "%E0%A4%A",
    });
  });

  test("match() supports :param+ rest parameters for multi-segment capture", () => {
    const prepared = routesHelper.prepare([
      { path: "/application/organizations/:params+", element: Dummy },
      { path: "/opportunities/pipeline/:params+", element: Dummy },
      { path: "/appointment/:id+", element: Dummy },
      { path: "/users/:id", element: Dummy },
    ]);

    expect(
      routesHelper.match(prepared, "/application/organizations/new").params
    ).toEqual({ params: "new" });
    expect(
      routesHelper.match(prepared, "/application/organizations/123/edit").params
    ).toEqual({ params: "123/edit" });
    expect(
      routesHelper.match(prepared, "/opportunities/pipeline/job/42/candidate/99").params
    ).toEqual({ params: "job/42/candidate/99" });
    expect(routesHelper.match(prepared, "/appointment/abc-123").params).toEqual({
      id: "abc-123",
    });
    expect(routesHelper.match(prepared, "/appointment/abc/123").params).toEqual({
      id: "abc/123",
    });

    expect(routesHelper.match(prepared, "/users/42").params).toEqual({ id: "42" });
    expect(routesHelper.match(prepared, "/users/42/extra").Component).not.toBe(Dummy);
  });

  test("prepare() tolerates trailing whitespace around :param+ segment names", () => {
    const prepared = routesHelper.prepare([
      { path: "/application/organizations/:params+ ", element: Dummy },
    ]);

    expect(
      routesHelper.match(prepared, "/application/organizations/123/edit").params
    ).toEqual({ params: "123/edit" });
  });
});
