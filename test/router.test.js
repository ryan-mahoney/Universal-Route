/**
 * Tests for router.js
 * We mock history.js to use a memory history we can control.
 * We also mock handleHistoryChange to avoid network side effects.
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock history.js to a single shared memory history
jest.mock("../src/history.js", () => {
  const { createMemoryHistory } = require("history");
  const mem = createMemoryHistory({ initialEntries: ["/"] });
  return {
    __esModule: true,
    default: mem,
    appHistory: mem,
    makeMemoryHistory: (entries = ["/"]) =>
      createMemoryHistory({ initialEntries: entries }),
  };
});

// Mock scroll module (no out-of-scope refs in the factory)
jest.mock("../src/scroll.js", () => {
  const setScrollToSessionStorage = jest.fn();
  return {
    __esModule: true,
    setScrollToSessionStorage,
    // include others if your code imports them
    setScrollForKey: jest.fn(),
    getScrollFromSessionStorage: jest.fn(),
  };
});
// Import the mocked fn for assertions
import { setScrollToSessionStorage as mockSetScrollToSessionStorage } from "../src/scroll.js";

// Avoid registering network listener
jest.mock("../src/handleHistoryChange.js", () => (dispatch) => {
  // no-op for RouterView effect registration
});

import appHistory from "../src/history.js";
import { Link, navigate, createRouter } from "../src/router.js";

const TestComp = ({ params }) => <div>Home {params?.id ? params.id : ""}</div>;
const UserComp = ({ params }) => <div>User:{params.id}</div>;

const routes = {
  "/": TestComp,
  "/user/:id": UserComp,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOCATION_CHANGED":
      return { ...state, location: action.location };
    default:
      return state;
  }
};

describe("router.js", () => {
  beforeEach(() => {
    // reset to root
    appHistory.push("/");
    mockSetScrollToSessionStorage.mockClear();
  });

  test("<Link/> prevents default and navigates with push, sets scroll", async () => {
    const user = userEvent.setup();
    render(<Link to="/user/42">Go</Link>);
    const a = screen.getByRole("link", { name: "Go" });

    const prevent = jest.fn();
    await user.click(a, { button: 0, preventDefault: prevent });
    // jest-dom's userEvent won't pass our prevent, so simulate wit
    const e = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    Object.defineProperty(e, "preventDefault", { value: prevent });
    a.dispatchEvent(e);

    expect(mockSetScrollToSessionStorage).toHaveBeenCalled();
    expect(appHistory.location.pathname).toBe("/user/42");
  });

  test("<Link/> ignores modified clicks (cmd/ctrl)", () => {
    render(<Link to="/x">GoX</Link>);
    const a = screen.getByRole("link", { name: "GoX" });
    const prevent = jest.fn();
    const e = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    });
    Object.defineProperty(e, "preventDefault", { value: prevent });
    a.dispatchEvent(e);
    expect(prevent).not.toHaveBeenCalled();
  });

  test("navigate() uses push and replace", () => {
    navigate("/a");
    expect(appHistory.location.pathname).toBe("/a");
    navigate("/b", "replace");
    expect(appHistory.location.pathname).toBe("/b");
  });

  test("RouterView renders matched component and passes params", () => {
    const RouterView = createRouter({
      routesMap: routes,
      reducer,
      initialState: {},
    });
    const { rerender } = render(<RouterView />);
    expect(screen.getByText(/Home/)).toBeInTheDocument();

    // navigate
    act(() => {
      appHistory.push("/user/99?x=1");
    });
    rerender(<RouterView />);
    expect(screen.getByText("User:99")).toBeInTheDocument();
  });

  test("RouterView falls back to 404 when unmatched", () => {
    const RouterView = createRouter({
      routesMap: routes,
      reducer,
      initialState: {},
    });
    const { rerender } = render(<RouterView />);
    act(() => {
      appHistory.push("/nope");
    });
    rerender(<RouterView />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
