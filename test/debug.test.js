import handleHistoryChange from "../src/handleHistoryChange.js";

// Simple test to debug the dispatch issue
test("debug dispatch issue", async () => {
  const history = {
    location: { pathname: "/", search: "" },
    push(path) {
      this.location = { pathname: path, search: "" };
      if (this.listener) {
        this.listener({ location: this.location, action: "PUSH" });
      }
    },
    listen(fn) {
      this.listener = fn;
      return () => {
        this.listener = null;
      };
    },
  };

  const fetchImpl = jest.fn(() =>
    Promise.resolve({
      status: 200,
      json: async () => ({ title: "Test" }),
    })
  );

  const setTitle = jest.fn();
  const progress = { start: jest.fn(), done: jest.fn() };
  const dispatch = jest.fn();

  handleHistoryChange(dispatch, { history, fetchImpl, setTitle, progress });
  history.push("/test");
  await new Promise((resolve) => setTimeout(resolve, 10)); // allow time for async operations

  expect(dispatch).toHaveBeenCalled();
});
