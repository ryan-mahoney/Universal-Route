import {
  parse,
  compile,
  tokensToFunction,
  match,
  regexpToFunction,
  tokensToRegexp,
  pathToRegexp,
} from "../src/pathToRegex";

describe("pathToRegex.js", () => {
  test("parse tokenizes params from a path pattern", () => {
    const tokens = parse("/users/:id");
    expect(tokens).toEqual([
      "/users",
      expect.objectContaining({ name: "id", prefix: "/" }),
    ]);
  });

  test("compile builds concrete paths from params", () => {
    const toPath = compile("/users/:id");
    expect(toPath({ id: "42" })).toBe("/users/42");
  });

  test("tokensToFunction throws for missing required param", () => {
    const toPath = tokensToFunction(parse("/users/:id"));
    expect(() => toPath({})).toThrow('Expected "id" to be a string');
  });

  test("match returns path and params for matching pathnames", () => {
    const matcher = match("/users/:id");
    expect(matcher("/users/77")).toEqual(
      expect.objectContaining({
        path: "/users/77",
        params: expect.objectContaining({ id: "77" }),
      })
    );
  });

  test("regexpToFunction maps regex captures into named params", () => {
    const re = /^\/items\/(\d+)$/;
    const keys = [{ name: "id", prefix: "", suffix: "", modifier: "" }];
    const fn = regexpToFunction(re, keys);

    expect(fn("/items/12")).toEqual(
      expect.objectContaining({
        path: "/items/12",
        params: expect.objectContaining({ id: "12" }),
      })
    );
    expect(fn("/items/nope")).toBe(false);
  });

  test("tokensToRegexp creates regex that matches compiled path tokens", () => {
    const keys = [];
    const re = tokensToRegexp(parse("/p/:slug"), keys);

    expect(re.test("/p/abc")).toBe(true);
    expect(re.test("/x/abc")).toBe(false);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toEqual(expect.objectContaining({ name: "slug" }));
  });

  test("pathToRegexp supports array patterns and parse rejects invalid patterns", () => {
    const re = pathToRegexp(["/a/:id", "/b/:id"]);
    expect(re.test("/a/1")).toBe(true);
    expect(re.test("/b/2")).toBe(true);
    expect(() => parse("/:")).toThrow("Missing parameter name");
  });
});
