/**
 * Tests for router.js with a REQUIRED store.
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

// Mock scroll module
jest.mock("../src/scroll.js", () => {
  const setScrollToSessionStorage = jest.fn();
  return {
    __esModule: true,
    setScrollToSessionStorage,
    setScrollForKey: jest.fn(),
    getScrollFromSessionStorage: jest.fn(),
  };
});
import { setScrollToSessionStorage as mockSetScrollToSessionStorage } from "../src/scroll.js";

// Avoid registering network listener
jest.mock("../src/handleHistoryChange.js", () => (dispatch) => {
  // no-op
});

import appHistory from "../src/history.js";
import { Link, navigate, createRouter } from "../src/router.js";

// Test components & routes
const Home = ({ params }) => <div>Home {params?.id ? params.id : ""}</div>;
const User = ({ params }) => <div>User:{params.id}</div>;
const routes = {
  "/": Home,
  "/user/:id": User,
};

const StateContext = React.createContext(null);
const TestProvider = ({ children, initial = {} }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "LOCATION_CHANGED":
        return { ...state, location: action.location };
      default:
        return state;
    }
  };
  const [state, dispatch] = React.useReducer(reducer, {
    ...initial,
    location: appHistory.location.pathname + (appHistory.location.search || ""),
  });
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

describe("router.js (store required)", () => {
  beforeEach(() => {
    appHistory.push("/");
    mockSetScrollToSessionStorage.mockClear();
  });

  test("createRouter throws if store is not provided", () => {
    expect(() => createRouter(routes)).toThrow(/a store\/context is required/i);
  });

  test("<Link/> prevents default and navigates with push, sets scroll", async () => {
    const user = userEvent.setup();
    render(<Link to="/user/42">Go</Link>);
    const a = screen.getByRole("link", { name: "Go" });

    // Simulate a normal left click
    const prevent = jest.fn();
    const e = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    Object.defineProperty(e, "preventDefault", { value: prevent });
    a.dispatchEvent(e);

    expect(prevent).toHaveBeenCalled();
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

  test("Router renders matched component and passes params (with required store)", () => {
    const Router = createRouter(routes, StateContext);
    const { rerender } = render(
      <TestProvider>
        <Router />
      </TestProvider>
    );
    expect(screen.getByText(/Home/)).toBeInTheDocument();

    act(() => {
      appHistory.push("/user/99?x=1");
    });
    rerender(
      <TestProvider>
        <Router />
      </TestProvider>
    );
    expect(screen.getByText("User:99")).toBeInTheDocument();
  });

  test("Router shows 404 for unmatched routes (with required store)", () => {
    // helper.match should yield a 404 component internally
    const Router = createRouter(routes, StateContext);
    const { rerender } = render(
      <TestProvider>
        <Router />
      </TestProvider>
    );

    act(() => {
      appHistory.push("/nope");
    });
    rerender(
      <TestProvider>
        <Router />
      </TestProvider>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
