import { makeMemoryHistory } from "../src/history.js";

describe("history.js", () => {
  test("makeMemoryHistory returns a history-like object", () => {
    const mem = makeMemoryHistory(["/"]);
    expect(typeof mem.listen).toBe("function");
    expect(typeof mem.push).toBe("function");
    expect(mem.location).toBeDefined();
  });
});
