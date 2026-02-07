import { makeMemoryHistory } from "../src/history.js";

describe("history.js", () => {
  test("makeMemoryHistory supports location updates and listen actions", () => {
    const mem = makeMemoryHistory(["/"]);
    const events = [];
    const unlisten = mem.listen((update) => events.push(update));

    expect(mem.location.pathname).toBe("/");

    mem.push("/pushed?x=1");
    expect(mem.location.pathname).toBe("/pushed");
    expect(mem.location.search).toBe("?x=1");
    expect(events[0].action).toBe("PUSH");
    expect(events[0].location.pathname).toBe("/pushed");

    mem.replace("/replaced");
    expect(mem.location.pathname).toBe("/replaced");
    expect(events[1].action).toBe("REPLACE");
    expect(events[1].location.pathname).toBe("/replaced");

    unlisten();
  });
});
