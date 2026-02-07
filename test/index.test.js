jest.mock("../src/history", () => {
  const history = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  return {
    __esModule: true,
    default: history,
    appHistory: history,
    makeMemoryHistory: jest.fn(),
  };
});

import * as API from "../src/index";
import mockedHistory from "../src/history";

describe("index.js re-exports", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("exports expected public API surface", () => {
    expect(typeof API.Link).toBe("function");
    expect(typeof API.navigate).toBe("function");
    expect(typeof API.createRouter).toBe("function");
    expect("appHistory" in API).toBe(true);
    expect(typeof API.makeMemoryHistory).toBe("function");
    expect(API.routesHelper).toBeDefined();
    expect(typeof API.routesHelper.prepare).toBe("function");
    expect(typeof API.handleHistoryChange).toBe("function");
    expect(typeof API.getScrollPosition).toBe("function");
    expect(typeof API.setScrollToSessionStorage).toBe("function");
    expect(typeof API.setScrollForKey).toBe("function");
    expect(typeof API.getScrollFromSessionStorage).toBe("function");
  });

  test("navigate delegates to history push/replace", () => {
    API.navigate("/alpha");
    API.navigate("/beta", { replace: true, state: { from: "index-test" } });

    expect(mockedHistory.push).toHaveBeenCalledWith("/alpha", undefined);
    expect(mockedHistory.replace).toHaveBeenCalledWith("/beta", {
      from: "index-test",
    });
  });
});
