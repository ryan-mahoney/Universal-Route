/**
 * Tests cover BOTH store and store-less modes.
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";

// Mock history.js
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

// Mock scroll.js
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

// Mock handleHistoryChange so we can assert it's NOT called in store-less mode
jest.mock("../src/handleHistoryChange.js", () => jest.fn());
import mockHandleHistoryChange from "../src/handleHistoryChange.js";

import appHistory from "../src/history.js";
import { Link, createRouter } from "../src/router.js";

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

describe("router.js (optional store)", () => {
  beforeEach(() => {
    appHistory.push("/");
    mockSetScrollToSessionStorage.mockClear();
    mockHandleHistoryChange.mockClear();
  });

  test("<Link/> navigates and sets scroll", () => {
    render(<Link to="/user/42">Go</Link>);
    const a = screen.getByRole("link", { name: "Go" });

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

  test("Router works WITH a store (effects enabled)", () => {
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
    expect(mockHandleHistoryChange).toHaveBeenCalledTimes(1);
  });

  test("Router works WITHOUT a store (effects disabled), driven by props", () => {
    const Router = createRouter(routes); // no store
    render(<Router location="/user/7" />);
    expect(screen.getByText("User:7")).toBeInTheDocument();
    expect(mockHandleHistoryChange).not.toHaveBeenCalled();
  });

  test("Router shows 404 for unmatched path (with store)", () => {
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
