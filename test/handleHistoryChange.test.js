import handleHistoryChange, { __test__ } from "../src/handleHistoryChange.js";
import { setScrollForKey } from "../src/scroll.js";

// Use fake timers for scroll restore setTimeout
jest.useFakeTimers();

// Flushes both the fetch .then() and the res.json() .then()
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

const makeHistory = (initial = "/") => {
  let location = { pathname: initial, search: "" };
  let listener = null;
  return {
    get location() {
      return location;
    },
    push(p) {
      location = {
        pathname: p.split("?")[0],
        search: p.includes("?") ? "?" + p.split("?")[1] : "",
      };
      if (listener) {
        listener({ location, action: "PUSH" });
      }
    },
    replace(p) {
      location = {
        pathname: p.split("?")[0],
        search: p.includes("?") ? "?" + p.split("?")[1] : "",
      };
      if (listener) {
        listener({ location, action: "REPLACE" });
      }
    },
    back() {
      if (listener) {
        listener({ location, action: "POP" });
      }
    },
    listen(fn) {
      listener = fn;
      // return unlisten
      return () => {
        listener = null;
      };
    },
  };
};

const okResponse = (body = {}) =>
  Promise.resolve({
    status: 200,
    json: async () => body,
  });

describe("handleHistoryChange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    __test__.reset();
  });

  test("registers only once", () => {
    const history = makeHistory("/");
    const fetchImpl = jest.fn(() => okResponse({ title: "Home" }));
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn();

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });
    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });

    history.push("/a");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  test("dispatches CHANGE_PAGE for ok/404/5xx and sets title", async () => {
    const history = makeHistory("/");
    const calls = [];
    const fetchImpl = jest
      .fn()
      .mockImplementationOnce(() => okResponse({ title: "Ok" }))
      .mockImplementationOnce(() =>
        Promise.resolve({ status: 404, json: async () => ({}) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ status: 503, json: async () => ({}) })
      );
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn((a) => calls.push(a));

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });

    history.push("/ok");
    await flush(); // flush both microtasks
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CHANGE_PAGE",
        data: expect.objectContaining({ location: "/ok", title: "Ok" }),
      })
    );
    expect(setTitle).toHaveBeenCalledWith("Ok");

    history.push("/missing");
    await flush(); // flush both microtasks
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CHANGE_PAGE",
        data: expect.objectContaining({ location: "/404" }),
      })
    );

    history.push("/err");
    await flush(); // flush both microtasks
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CHANGE_PAGE",
        data: expect.objectContaining({ location: "/500" }),
      })
    );
  });

  test("respects authorization redirect in response.data.authorization.location", async () => {
    const history = makeHistory("/");
    const fetchImpl = jest.fn(() =>
      okResponse({ authorization: { location: "/login" }, title: "Auth" })
    );
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn();

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });
    history.push("/secret");
    await flush(); // flush both microtasks

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CHANGE_PAGE",
        data: expect.objectContaining({ location: "/login" }),
      })
    );
  });

  test("aborts in-flight fetch on new navigation", async () => {
    const history = makeHistory("/");
    let aborted = false;
    const fetchImpl = jest.fn(
      (url, opts) =>
        new Promise((resolve, reject) => {
          opts.signal.addEventListener("abort", () => {
            aborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    );
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn();

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });
    history.push("/long");
    // Trigger a second navigation to cause abort
    history.push("/next");
    await flush(); // flush both microtasks
    expect(aborted).toBe(true);
  });

  test("scrolls to top on PUSH and restores from sessionStorage on POP/REPLACE", async () => {
    const history = makeHistory("/");
    const fetchImpl = jest.fn(() => okResponse({ title: "S" }));
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn();

    // Store previous scroll for /prev
    setScrollForKey("/prev", { x: 7, y: 9 });

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });

    history.push("/push");
    await flush(); // flush both microtasks
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    history.replace("/prev");
    await flush(); // flush both microtasks
    // advance timers to allow delayed scroll restore
    jest.advanceTimersByTime(300);
    expect(window.scrollTo).toHaveBeenCalledWith(7, 9);
  });

  test("includes a uuid query param in request URL", async () => {
    const history = makeHistory("/");
    const fetchImpl = jest.fn((url) => {
      const u = new URL(url);
      expect(u.searchParams.get("uuid")).toBeTruthy();
      return okResponse({ title: "U" });
    });
    const setTitle = jest.fn();
    const progress = { start: jest.fn(), done: jest.fn() };
    const dispatch = jest.fn();

    handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });
    history.push("/with-uuid");
    await flush(); // flush both microtasks
  });
});
