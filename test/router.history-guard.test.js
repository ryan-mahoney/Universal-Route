describe("router history guards", () => {
  test("navigate throws explicit error when history is unavailable", () => {
    jest.isolateModules(() => {
      jest.doMock("../src/history", () => ({
        __esModule: true,
        default: null,
      }));
      const { navigate } = require("../src/router");
      expect(() => navigate("/x")).toThrow(
        "History is unavailable in this environment. Use makeMemoryHistory for non-browser usage."
      );
    });
  });

  test("Link click throws explicit error when history is unavailable", () => {
    jest.isolateModules(() => {
      jest.doMock("../src/history", () => ({
        __esModule: true,
        default: null,
      }));
      const { Link } = require("../src/router");
      const anchor = Link({ to: "/x", children: "x" });
      const event = {
        defaultPrevented: false,
        button: 0,
        metaKey: false,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      expect(() => anchor.props.onClick(event)).toThrow(
        "History is unavailable in this environment. Use makeMemoryHistory for non-browser usage."
      );
    });
  });
});
