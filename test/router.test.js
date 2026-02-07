import React, { act } from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  createEvent,
} from "@testing-library/react";

import { createRouter, Link, navigate } from "../src/router.js";

// ---- Mock a real-ish shared memory history ----
jest.mock("../src/history.js", () => {
  let listeners = [];

  const parsePath = (path, prev) => {
    if (typeof path === "string") {
      const [pathname, q = ""] = path.split("?");
      return { pathname, search: q ? `?${q}` : "" };
    }
    if (path && typeof path === "object") {
      return {
        pathname: path.pathname || prev.pathname || "/",
        search: path.search || "",
      };
    }
    return prev || { pathname: "/", search: "" };
  };

  const history = {
    location: { pathname: "/a", search: "" },
    push(path, state) {
      history.location = parsePath(path, history.location);
      const payload = { location: history.location, action: "PUSH", state };
      listeners.forEach((fn) => fn(payload));
    },
    replace(path, state) {
      history.location = parsePath(path, history.location);
      const payload = { location: history.location, action: "REPLACE", state };
      listeners.forEach((fn) => fn(payload));
    },
    listen(fn) {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter((x) => x !== fn);
      };
    },
  };

  return { __esModule: true, default: history };
});

// Re-import after mock so we get the mocked default
// eslint-disable-next-line import/first
import mockedHistory from "../src/history.js";

// Test pages
const PageA = () => (
  <div>
    <h1>Page A</h1>
    <Link to="/b" data-testid="goto-b">
      go b
    </Link>
  </div>
);
const PageB = () => <h1>Page B</h1>;
const NotFound = () => <h1>Not Found</h1>;
const UserPage = ({ id }) => <h1>User {id}</h1>;

const routes = [
  { path: "/a", element: PageA },
  { path: "/b", element: PageB },
  { path: "*", element: NotFound },
];

// Minimal StateContext matching the router’s expectations
const StateContext = React.createContext({
  state: { location: "/a" },
  dispatch: () => {},
});

describe("Router", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("navigate(..., { replace: true }) calls history.replace with state", () => {
    const replaceSpy = jest.spyOn(mockedHistory, "replace");
    const pushSpy = jest.spyOn(mockedHistory, "push");
    const state = { from: "test" };

    navigate("/target", { replace: true, state });

    expect(replaceSpy).toHaveBeenCalledWith("/target", state);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  test("does NOT dispatch on initial mount (store already hydrated)", () => {
    const dispatch = jest.fn();
    const value = { state: { location: "/a" }, dispatch };

    const Router = createRouter(routes, StateContext);

    render(
      <StateContext.Provider value={value}>
        <Router />
      </StateContext.Provider>
    );

    expect(screen.getByText("Page A")).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("dispatches LOCATION_CHANGED only on real navigation (history.push)", async () => {
    const dispatch = jest.fn();
    const value = { state: { location: "/a" }, dispatch };
    const Router = createRouter(routes, StateContext);

    render(
      <StateContext.Provider value={value}>
        <Router />
      </StateContext.Provider>
    );

    // Same-path push should NOT dispatch or change view
    await act(async () => {
      mockedHistory.push("/a");
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText("Page A")).toBeInTheDocument();

    // Real change should dispatch once and render Page B
    await act(async () => {
      mockedHistory.push("/b?x=1");
    });
    await waitFor(() => expect(screen.getByText("Page B")).toBeInTheDocument());
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "LOCATION_CHANGED",
        location: "/b?x=1",
        meta: expect.objectContaining({ action: "PUSH" }),
      })
    );
  });

  test("<Link> prevents default and navigates with history.push", async () => {
    await act(async () => {
      mockedHistory.replace("/a"); // ensure we're on /a
    });
    const dispatch = jest.fn();
    const value = { state: { location: "/a" }, dispatch };
    const Router = createRouter(routes, StateContext);

    render(
      <StateContext.Provider value={value}>
        <Router />
      </StateContext.Provider>
    );

    const link = screen.getByTestId("goto-b");
    await act(async () => {
      fireEvent.click(link);
    });

    await waitFor(() => expect(screen.getByText("Page B")).toBeInTheDocument());
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "LOCATION_CHANGED",
        location: "/b",
      })
    );
  });

  test("<Link replace> routes click through history.replace", async () => {
    const replaceSpy = jest.spyOn(mockedHistory, "replace");
    const pushSpy = jest.spyOn(mockedHistory, "push");

    render(
      <Link replace to="/b" data-testid="replace-link">
        replace
      </Link>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("replace-link"));
    });

    expect(replaceSpy).toHaveBeenCalledWith("/b", undefined);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  test("renders catch-all route when no match", async () => {
    await act(async () => {
      mockedHistory.replace("/unknown");
    });
    const dispatch = jest.fn();
    const value = { state: { location: "/unknown" }, dispatch };
    const Router = createRouter(routes, StateContext);

    render(
      <StateContext.Provider value={value}>
        <Router />
      </StateContext.Provider>
    );

    expect(screen.getByText("Not Found")).toBeInTheDocument();
    // No dispatch on mount
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("forwards dynamic route params to matched component props", async () => {
    await act(async () => {
      mockedHistory.replace("/users/42");
    });
    const dispatch = jest.fn();
    const value = { state: { location: "/users/42" }, dispatch };
    const Router = createRouter(
      [
        { path: "/users/:id", element: UserPage },
        { path: "*", element: NotFound },
      ],
      StateContext
    );

    render(
      <StateContext.Provider value={value}>
        <Router />
      </StateContext.Provider>
    );

    expect(screen.getByText("User 42")).toBeInTheDocument();
  });

  test("throws TypeError when Link to is not a string or location object", () => {
    expect(() => render(<Link to={42}>bad</Link>)).toThrow(TypeError);
  });

  test("throws TypeError when location object pathname is missing", () => {
    expect(() => render(<Link to={{ search: "?x=1" }}>bad</Link>)).toThrow(TypeError);
  });

  test("throws TypeError when location object pathname is empty", () => {
    expect(() => render(<Link to={{ pathname: "" }}>bad</Link>)).toThrow(TypeError);
  });

  test("does not intercept modified, non-left, or already-prevented clicks", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");
    const replaceSpy = jest.spyOn(mockedHistory, "replace");

    render(
      <Link to="#guarded" data-testid="guard-link">
        guarded
      </Link>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("guard-link"), { metaKey: true });
      fireEvent.click(screen.getByTestId("guard-link"), { ctrlKey: true });
      fireEvent.click(screen.getByTestId("guard-link"), { shiftKey: true });
      fireEvent.click(screen.getByTestId("guard-link"), { altKey: true });
      fireEvent.click(screen.getByTestId("guard-link"), { button: 1 });
      const preventedEvent = createEvent.click(screen.getByTestId("guard-link"));
      preventedEvent.preventDefault();
      fireEvent(screen.getByTestId("guard-link"), preventedEvent);
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  test("non-intercept case keeps default prevented event and skips navigation", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");

    render(
      <Link to="#no-intercept" data-testid="no-intercept-link">
        no intercept
      </Link>
    );

    const event = createEvent.click(screen.getByTestId("no-intercept-link"));
    event.preventDefault();

    await act(async () => {
      fireEvent(screen.getByTestId("no-intercept-link"), event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  test("supports object-style to with pathname, search, and hash", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");
    const to = { pathname: "/b", search: "?x=1", hash: "#section" };

    render(
      <Link to={to} data-testid="object-link">
        object
      </Link>
    );

    const link = screen.getByTestId("object-link");
    expect(link.getAttribute("href")).toBe("/b?x=1#section");

    await act(async () => {
      fireEvent.click(link);
    });

    expect(pushSpy).toHaveBeenCalledWith(to, undefined);
  });

  test("does not intercept protocol-relative URLs", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");

    render(
      <Link to="//example.com/out" data-testid="proto-relative-link">
        external
      </Link>
    );

    const link = screen.getByTestId("proto-relative-link");
    const event = createEvent.click(link);

    await act(async () => {
      fireEvent(link, event);
    });

    expect(event.defaultPrevented).toBe(false);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  test("does not intercept absolute cross-origin URLs", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");

    render(
      <Link to="https://example.com/out" data-testid="cross-origin-link">
        external
      </Link>
    );

    const link = screen.getByTestId("cross-origin-link");
    const event = createEvent.click(link);

    await act(async () => {
      fireEvent(link, event);
    });

    expect(event.defaultPrevented).toBe(false);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  test("intercepts absolute same-origin URLs and pushes client path", async () => {
    const pushSpy = jest.spyOn(mockedHistory, "push");
    const sameOriginHref = `${window.location.origin}/b?x=1#section`;

    render(
      <Link to={sameOriginHref} data-testid="same-origin-link">
        same origin
      </Link>
    );

    const link = screen.getByTestId("same-origin-link");
    const event = createEvent.click(link);

    await act(async () => {
      fireEvent(link, event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(pushSpy).toHaveBeenCalledWith("/b?x=1#section", undefined);
  });
});
