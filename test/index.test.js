import * as API from "../src/index.js";

describe("index.js re-exports", () => {
  test("exports Link, navigate, createRouter", () => {
    expect(typeof API.Link).toBe("function");
    expect(typeof API.navigate).toBe("function");
    expect(typeof API.createRouter).toBe("function");
  });

  test("exports appHistory and makeMemoryHistory", () => {
    expect("appHistory" in API).toBe(true);
    expect(typeof API.makeMemoryHistory).toBe("function");
  });

  test("exports routesHelper", () => {
    expect(API.routesHelper).toBeDefined();
    expect(typeof API.routesHelper.prepare).toBe("function");
  });
});
