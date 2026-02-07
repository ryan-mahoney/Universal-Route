import {
  getScrollPosition,
  setScrollToSessionStorage,
  setScrollForKey,
  getScrollFromSessionStorage,
} from "../src/scroll";

describe("scroll.js", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // Reset scroll
    Object.defineProperty(window, "pageXOffset", { value: 10, writable: true });
    Object.defineProperty(window, "pageYOffset", { value: 20, writable: true });
  });

  test("getScrollPosition() reads window offsets", () => {
    const pos = getScrollPosition();
    expect(pos).toEqual({ x: 10, y: 20 });
  });

  test("setScrollToSessionStorage() stores current scroll for current location key", () => {
    // default location = /
    setScrollToSessionStorage();
    const store = JSON.parse(window.sessionStorage.getItem("scroll"));
    expect(store["/"]).toEqual({ x: 10, y: 20 });
  });

  test("setScrollForKey() stores provided position", () => {
    setScrollForKey("/abc?x=1", { x: 111, y: 222 });
    const store = JSON.parse(window.sessionStorage.getItem("scroll"));
    expect(store["/abc?x=1"]).toEqual({ x: 111, y: 222 });
  });

  test("getScrollFromSessionStorage() returns store or value by key", () => {
    setScrollForKey("/a", { x: 1, y: 2 });
    setScrollForKey("/b", { x: 3, y: 4 });
    expect(getScrollFromSessionStorage("*")).toEqual({
      "/a": { x: 1, y: 2 },
      "/b": { x: 3, y: 4 },
    });
    expect(getScrollFromSessionStorage("/b")).toEqual({ x: 3, y: 4 });
    expect(getScrollFromSessionStorage("/nope")).toBeNull();
  });

  test("evicts oldest scroll entries beyond 100 keys", () => {
    for (let i = 0; i < 105; i += 1) {
      setScrollForKey(`/k${i}`, { x: i, y: i });
    }

    const store = getScrollFromSessionStorage("*");
    expect(Object.keys(store)).toHaveLength(100);
    expect(store["/k0"]).toBeUndefined();
    expect(store["/k4"]).toBeUndefined();
    expect(store["/k5"]).toEqual({ x: 5, y: 5 });
    expect(store["/k104"]).toEqual({ x: 104, y: 104 });
  });
});
