var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

// ../node_modules/path-to-regexp/dist/index.js
var require_dist = __commonJS({
  "../node_modules/path-to-regexp/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenData = void 0;
    exports.parse = parse;
    exports.compile = compile;
    exports.match = match2;
    exports.pathToRegexp = pathToRegexp;
    exports.stringify = stringify;
    var DEFAULT_DELIMITER = "/";
    var NOOP_VALUE = (value) => value;
    var ID_START = /^[$_\p{ID_Start}]$/u;
    var ID_CONTINUE = /^[$\u200c\u200d\p{ID_Continue}]$/u;
    var DEBUG_URL = "https://git.new/pathToRegexpError";
    var SIMPLE_TOKENS = {
      // Groups.
      "{": "{",
      "}": "}",
      // Reserved.
      "(": "(",
      ")": ")",
      "[": "[",
      "]": "]",
      "+": "+",
      "?": "?",
      "!": "!",
    };
    function escapeText(str) {
      return str.replace(/[{}()\[\]+?!:*]/g, "\\$&");
    }
    function escape(str) {
      return str.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
    }
    function* lexer(str) {
      const chars = [...str];
      let i = 0;
      function name() {
        let value = "";
        if (ID_START.test(chars[++i])) {
          value += chars[i];
          while (ID_CONTINUE.test(chars[++i])) {
            value += chars[i];
          }
        } else if (chars[i] === '"') {
          let pos = i;
          while (i < chars.length) {
            if (chars[++i] === '"') {
              i++;
              pos = 0;
              break;
            }
            if (chars[i] === "\\") {
              value += chars[++i];
            } else {
              value += chars[i];
            }
          }
          if (pos) {
            throw new TypeError(`Unterminated quote at ${pos}: ${DEBUG_URL}`);
          }
        }
        if (!value) {
          throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);
        }
        return value;
      }
      while (i < chars.length) {
        const value = chars[i];
        const type = SIMPLE_TOKENS[value];
        if (type) {
          yield { type, index: i++, value };
        } else if (value === "\\") {
          yield { type: "ESCAPED", index: i++, value: chars[i++] };
        } else if (value === ":") {
          const value2 = name();
          yield { type: "PARAM", index: i, value: value2 };
        } else if (value === "*") {
          const value2 = name();
          yield { type: "WILDCARD", index: i, value: value2 };
        } else {
          yield { type: "CHAR", index: i, value: chars[i++] };
        }
      }
      return { type: "END", index: i, value: "" };
    }
    var Iter = class {
      constructor(tokens) {
        this.tokens = tokens;
      }
      peek() {
        if (!this._peek) {
          const next = this.tokens.next();
          this._peek = next.value;
        }
        return this._peek;
      }
      tryConsume(type) {
        const token = this.peek();
        if (token.type !== type) return;
        this._peek = void 0;
        return token.value;
      }
      consume(type) {
        const value = this.tryConsume(type);
        if (value !== void 0) return value;
        const { type: nextType, index } = this.peek();
        throw new TypeError(
          `Unexpected ${nextType} at ${index}, expected ${type}: ${DEBUG_URL}`
        );
      }
      text() {
        let result = "";
        let value;
        while (
          (value = this.tryConsume("CHAR") || this.tryConsume("ESCAPED"))
        ) {
          result += value;
        }
        return result;
      }
    };
    var TokenData = class {
      constructor(tokens) {
        this.tokens = tokens;
      }
    };
    exports.TokenData = TokenData;
    function parse(str, options = {}) {
      const { encodePath = NOOP_VALUE } = options;
      const it = new Iter(lexer(str));
      function consume(endType) {
        const tokens2 = [];
        while (true) {
          const path = it.text();
          if (path) tokens2.push({ type: "text", value: encodePath(path) });
          const param = it.tryConsume("PARAM");
          if (param) {
            tokens2.push({
              type: "param",
              name: param,
            });
            continue;
          }
          const wildcard = it.tryConsume("WILDCARD");
          if (wildcard) {
            tokens2.push({
              type: "wildcard",
              name: wildcard,
            });
            continue;
          }
          const open = it.tryConsume("{");
          if (open) {
            tokens2.push({
              type: "group",
              tokens: consume("}"),
            });
            continue;
          }
          it.consume(endType);
          return tokens2;
        }
      }
      const tokens = consume("END");
      return new TokenData(tokens);
    }
    function compile(path, options = {}) {
      const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } =
        options;
      const data = path instanceof TokenData ? path : parse(path, options);
      const fn = tokensToFunction(data.tokens, delimiter, encode);
      return function path2(data2 = {}) {
        const [path3, ...missing] = fn(data2);
        if (missing.length) {
          throw new TypeError(`Missing parameters: ${missing.join(", ")}`);
        }
        return path3;
      };
    }
    function tokensToFunction(tokens, delimiter, encode) {
      const encoders = tokens.map((token) =>
        tokenToFunction(token, delimiter, encode)
      );
      return (data) => {
        const result = [""];
        for (const encoder of encoders) {
          const [value, ...extras] = encoder(data);
          result[0] += value;
          result.push(...extras);
        }
        return result;
      };
    }
    function tokenToFunction(token, delimiter, encode) {
      if (token.type === "text") return () => [token.value];
      if (token.type === "group") {
        const fn = tokensToFunction(token.tokens, delimiter, encode);
        return (data) => {
          const [value, ...missing] = fn(data);
          if (!missing.length) return [value];
          return [""];
        };
      }
      const encodeValue = encode || NOOP_VALUE;
      if (token.type === "wildcard" && encode !== false) {
        return (data) => {
          const value = data[token.name];
          if (value == null) return ["", token.name];
          if (!Array.isArray(value) || value.length === 0) {
            throw new TypeError(
              `Expected "${token.name}" to be a non-empty array`
            );
          }
          return [
            value
              .map((value2, index) => {
                if (typeof value2 !== "string") {
                  throw new TypeError(
                    `Expected "${token.name}/${index}" to be a string`
                  );
                }
                return encodeValue(value2);
              })
              .join(delimiter),
          ];
        };
      }
      return (data) => {
        const value = data[token.name];
        if (value == null) return ["", token.name];
        if (typeof value !== "string") {
          throw new TypeError(`Expected "${token.name}" to be a string`);
        }
        return [encodeValue(value)];
      };
    }
    function match2(path, options = {}) {
      const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } =
        options;
      const { regexp, keys } = pathToRegexp(path, options);
      const decoders = keys.map((key) => {
        if (decode === false) return NOOP_VALUE;
        if (key.type === "param") return decode;
        return (value) => value.split(delimiter).map(decode);
      });
      return function match3(input) {
        const m = regexp.exec(input);
        if (!m) return false;
        const path2 = m[0];
        const params = /* @__PURE__ */ Object.create(null);
        for (let i = 1; i < m.length; i++) {
          if (m[i] === void 0) continue;
          const key = keys[i - 1];
          const decoder = decoders[i - 1];
          params[key.name] = decoder(m[i]);
        }
        return { path: path2, params };
      };
    }
    function pathToRegexp(path, options = {}) {
      const {
        delimiter = DEFAULT_DELIMITER,
        end = true,
        sensitive = false,
        trailing = true,
      } = options;
      const keys = [];
      const sources = [];
      const flags = sensitive ? "" : "i";
      const paths = Array.isArray(path) ? path : [path];
      const items = paths.map((path2) =>
        path2 instanceof TokenData ? path2 : parse(path2, options)
      );
      for (const { tokens } of items) {
        for (const seq of flatten(tokens, 0, [])) {
          const regexp2 = sequenceToRegExp(seq, delimiter, keys);
          sources.push(regexp2);
        }
      }
      let pattern = `^(?:${sources.join("|")})`;
      if (trailing) pattern += `(?:${escape(delimiter)}$)?`;
      pattern += end ? "$" : `(?=${escape(delimiter)}|$)`;
      const regexp = new RegExp(pattern, flags);
      return { regexp, keys };
    }
    function* flatten(tokens, index, init) {
      if (index === tokens.length) {
        return yield init;
      }
      const token = tokens[index];
      if (token.type === "group") {
        const fork = init.slice();
        for (const seq of flatten(token.tokens, 0, fork)) {
          yield* flatten(tokens, index + 1, seq);
        }
      } else {
        init.push(token);
      }
      yield* flatten(tokens, index + 1, init);
    }
    function sequenceToRegExp(tokens, delimiter, keys) {
      let result = "";
      let backtrack = "";
      let isSafeSegmentParam = true;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text") {
          result += escape(token.value);
          backtrack += token.value;
          isSafeSegmentParam ||
            (isSafeSegmentParam = token.value.includes(delimiter));
          continue;
        }
        if (token.type === "param" || token.type === "wildcard") {
          if (!isSafeSegmentParam && !backtrack) {
            throw new TypeError(
              `Missing text after "${token.name}": ${DEBUG_URL}`
            );
          }
          if (token.type === "param") {
            result += `(${negate(
              delimiter,
              isSafeSegmentParam ? "" : backtrack
            )}+)`;
          } else {
            result += `([\\s\\S]+)`;
          }
          keys.push(token);
          backtrack = "";
          isSafeSegmentParam = false;
          continue;
        }
      }
      return result;
    }
    function negate(delimiter, backtrack) {
      if (backtrack.length < 2) {
        if (delimiter.length < 2) return `[^${escape(delimiter + backtrack)}]`;
        return `(?:(?!${escape(delimiter)})[^${escape(backtrack)}])`;
      }
      if (delimiter.length < 2) {
        return `(?:(?!${escape(backtrack)})[^${escape(delimiter)}])`;
      }
      return `(?:(?!${escape(backtrack)}|${escape(delimiter)})[\\s\\S])`;
    }
    function stringify(data) {
      return data.tokens
        .map(function stringifyToken(token, index, tokens) {
          if (token.type === "text") return escapeText(token.value);
          if (token.type === "group") {
            return `{${token.tokens.map(stringifyToken).join("")}}`;
          }
          const isSafe =
            isNameSafe(token.name) && isNextNameSafe(tokens[index + 1]);
          const key = isSafe ? token.name : JSON.stringify(token.name);
          if (token.type === "param") return `:${key}`;
          if (token.type === "wildcard") return `*${key}`;
          throw new TypeError(`Unexpected token: ${token}`);
        })
        .join("");
    }
    function isNameSafe(name) {
      const [first, ...rest] = name;
      if (!ID_START.test(first)) return false;
      return rest.every((char) => ID_CONTINUE.test(char));
    }
    function isNextNameSafe(token) {
      if ((token === null || token === void 0 ? void 0 : token.type) !== "text")
        return true;
      return !ID_CONTINUE.test(token.value[0]);
    }
  },
});

// ../node_modules/nprogress/nprogress.js
var require_nprogress = __commonJS({
  "../node_modules/nprogress/nprogress.js"(exports, module) {
    (function (root2, factory) {
      if (typeof define === "function" && define.amd) {
        define(factory);
      } else if (typeof exports === "object") {
        module.exports = factory();
      } else {
        root2.NProgress = factory();
      }
    })(exports, function () {
      var NProgress = {};
      NProgress.version = "0.2.0";
      var Settings = (NProgress.settings = {
        minimum: 0.08,
        easing: "ease",
        positionUsing: "",
        speed: 200,
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: "body",
        template:
          '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
      });
      NProgress.configure = function (options) {
        var key, value;
        for (key in options) {
          value = options[key];
          if (value !== void 0 && options.hasOwnProperty(key))
            Settings[key] = value;
        }
        return this;
      };
      NProgress.status = null;
      NProgress.set = function (n) {
        var started = NProgress.isStarted();
        n = clamp(n, Settings.minimum, 1);
        NProgress.status = n === 1 ? null : n;
        var progress = NProgress.render(!started),
          bar = progress.querySelector(Settings.barSelector),
          speed = Settings.speed,
          ease = Settings.easing;
        progress.offsetWidth;
        queue(function (next) {
          if (Settings.positionUsing === "")
            Settings.positionUsing = NProgress.getPositioningCSS();
          css(bar, barPositionCSS(n, speed, ease));
          if (n === 1) {
            css(progress, {
              transition: "none",
              opacity: 1,
            });
            progress.offsetWidth;
            setTimeout(function () {
              css(progress, {
                transition: "all " + speed + "ms linear",
                opacity: 0,
              });
              setTimeout(function () {
                NProgress.remove();
                next();
              }, speed);
            }, speed);
          } else {
            setTimeout(next, speed);
          }
        });
        return this;
      };
      NProgress.isStarted = function () {
        return typeof NProgress.status === "number";
      };
      NProgress.start = function () {
        if (!NProgress.status) NProgress.set(0);
        var work = function () {
          setTimeout(function () {
            if (!NProgress.status) return;
            NProgress.trickle();
            work();
          }, Settings.trickleSpeed);
        };
        if (Settings.trickle) work();
        return this;
      };
      NProgress.done = function (force) {
        if (!force && !NProgress.status) return this;
        return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
      };
      NProgress.inc = function (amount) {
        var n = NProgress.status;
        if (!n) {
          return NProgress.start();
        } else {
          if (typeof amount !== "number") {
            amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
          }
          n = clamp(n + amount, 0, 0.994);
          return NProgress.set(n);
        }
      };
      NProgress.trickle = function () {
        return NProgress.inc(Math.random() * Settings.trickleRate);
      };
      (function () {
        var initial = 0,
          current = 0;
        NProgress.promise = function ($promise) {
          if (!$promise || $promise.state() === "resolved") {
            return this;
          }
          if (current === 0) {
            NProgress.start();
          }
          initial++;
          current++;
          $promise.always(function () {
            current--;
            if (current === 0) {
              initial = 0;
              NProgress.done();
            } else {
              NProgress.set((initial - current) / initial);
            }
          });
          return this;
        };
      })();
      NProgress.render = function (fromStart) {
        if (NProgress.isRendered()) return document.getElementById("nprogress");
        addClass(document.documentElement, "nprogress-busy");
        var progress = document.createElement("div");
        progress.id = "nprogress";
        progress.innerHTML = Settings.template;
        var bar = progress.querySelector(Settings.barSelector),
          perc = fromStart ? "-100" : toBarPerc(NProgress.status || 0),
          parent = document.querySelector(Settings.parent),
          spinner;
        css(bar, {
          transition: "all 0 linear",
          transform: "translate3d(" + perc + "%,0,0)",
        });
        if (!Settings.showSpinner) {
          spinner = progress.querySelector(Settings.spinnerSelector);
          spinner && removeElement(spinner);
        }
        if (parent != document.body) {
          addClass(parent, "nprogress-custom-parent");
        }
        parent.appendChild(progress);
        return progress;
      };
      NProgress.remove = function () {
        removeClass(document.documentElement, "nprogress-busy");
        removeClass(
          document.querySelector(Settings.parent),
          "nprogress-custom-parent"
        );
        var progress = document.getElementById("nprogress");
        progress && removeElement(progress);
      };
      NProgress.isRendered = function () {
        return !!document.getElementById("nprogress");
      };
      NProgress.getPositioningCSS = function () {
        var bodyStyle = document.body.style;
        var vendorPrefix =
          "WebkitTransform" in bodyStyle
            ? "Webkit"
            : "MozTransform" in bodyStyle
            ? "Moz"
            : "msTransform" in bodyStyle
            ? "ms"
            : "OTransform" in bodyStyle
            ? "O"
            : "";
        if (vendorPrefix + "Perspective" in bodyStyle) {
          return "translate3d";
        } else if (vendorPrefix + "Transform" in bodyStyle) {
          return "translate";
        } else {
          return "margin";
        }
      };
      function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
      }
      function toBarPerc(n) {
        return (-1 + n) * 100;
      }
      function barPositionCSS(n, speed, ease) {
        var barCSS;
        if (Settings.positionUsing === "translate3d") {
          barCSS = { transform: "translate3d(" + toBarPerc(n) + "%,0,0)" };
        } else if (Settings.positionUsing === "translate") {
          barCSS = { transform: "translate(" + toBarPerc(n) + "%,0)" };
        } else {
          barCSS = { "margin-left": toBarPerc(n) + "%" };
        }
        barCSS.transition = "all " + speed + "ms " + ease;
        return barCSS;
      }
      var queue = /* @__PURE__ */ (function () {
        var pending = [];
        function next() {
          var fn = pending.shift();
          if (fn) {
            fn(next);
          }
        }
        return function (fn) {
          pending.push(fn);
          if (pending.length == 1) next();
        };
      })();
      var css = /* @__PURE__ */ (function () {
        var cssPrefixes = ["Webkit", "O", "Moz", "ms"],
          cssProps = {};
        function camelCase(string) {
          return string
            .replace(/^-ms-/, "ms-")
            .replace(/-([\da-z])/gi, function (match2, letter) {
              return letter.toUpperCase();
            });
        }
        function getVendorProp(name) {
          var style = document.body.style;
          if (name in style) return name;
          var i = cssPrefixes.length,
            capName = name.charAt(0).toUpperCase() + name.slice(1),
            vendorName;
          while (i--) {
            vendorName = cssPrefixes[i] + capName;
            if (vendorName in style) return vendorName;
          }
          return name;
        }
        function getStyleProp(name) {
          name = camelCase(name);
          return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }
        function applyCss(element, prop, value) {
          prop = getStyleProp(prop);
          element.style[prop] = value;
        }
        return function (element, properties) {
          var args = arguments,
            prop,
            value;
          if (args.length == 2) {
            for (prop in properties) {
              value = properties[prop];
              if (value !== void 0 && properties.hasOwnProperty(prop))
                applyCss(element, prop, value);
            }
          } else {
            applyCss(element, args[1], args[2]);
          }
        };
      })();
      function hasClass(element, name) {
        var list = typeof element == "string" ? element : classList(element);
        return list.indexOf(" " + name + " ") >= 0;
      }
      function addClass(element, name) {
        var oldList = classList(element),
          newList = oldList + name;
        if (hasClass(oldList, name)) return;
        element.className = newList.substring(1);
      }
      function removeClass(element, name) {
        var oldList = classList(element),
          newList;
        if (!hasClass(element, name)) return;
        newList = oldList.replace(" " + name + " ", " ");
        element.className = newList.substring(1, newList.length - 1);
      }
      function classList(element) {
        return (" " + (element.className || "") + " ").replace(/\s+/gi, " ");
      }
      function removeElement(element) {
        element &&
          element.parentNode &&
          element.parentNode.removeChild(element);
      }
      return NProgress;
    });
  },
});

// app.js
import React4 from "react";
import { createRoot } from "react-dom/client";

// mockFetch.js
function installMockFetch({ latency = 120 } = {}) {
  const staticPages = {
    "/": { title: "Home", pageData: { blurb: "Welcome to the demo." } },
    "/about": {
      title: "About",
      pageData: { blurb: "This is a mock backend." },
    },
  };
  const userRoute = /^\/users\/([^/]+)$/;
  globalThis.fetch = async (reqUrl) => {
    const u = new URL(reqUrl, location.origin);
    const path = u.pathname;
    let status = 200;
    let data = staticPages[path];
    if (!data) {
      const m = path.match(userRoute);
      if (m) {
        const id = m[1];
        data = { title: `User ${id}`, pageData: { id, role: "tester" } };
      }
    }
    if (!data) {
      status = 404;
      data = { title: "Not Found", pageData: { path } };
    }
    await new Promise((r) => setTimeout(r, latency));
    return {
      status,
      json: async () => data,
    };
  };
}

// ../src/router.js
import React2 from "react";

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

// ../node_modules/history/index.js
var Action;
(function (Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
var readOnly = true
  ? function (obj) {
      return Object.freeze(obj);
    }
  : function (obj) {
      return obj;
    };
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {}
  }
}
var BeforeUnloadEventType = "beforeunload";
var PopStateEventType = "popstate";
function createBrowserHistory(options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options,
    _options$window = _options.window,
    window2 =
      _options$window === void 0 ? document.defaultView : _options$window;
  var globalHistory = window2.history;
  function getIndexAndLocation() {
    var _window$location = window2.location,
      pathname = _window$location.pathname,
      search = _window$location.search,
      hash = _window$location.hash;
    var state = globalHistory.state || {};
    return [
      state.idx,
      readOnly({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || "default",
      }),
    ];
  }
  var blockedPopTx = null;
  function handlePop() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      var nextAction = Action.Pop;
      var _getIndexAndLocation = getIndexAndLocation(),
        nextIndex = _getIndexAndLocation[0],
        nextLocation = _getIndexAndLocation[1];
      if (blockers.length) {
        if (nextIndex != null) {
          var delta = index - nextIndex;
          if (delta) {
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry: function retry() {
                go(delta * -1);
              },
            };
            go(delta);
          }
        } else {
          true
            ? warning(
                false,
                // TODO: Write up a doc that explains our blocking strategy in
                // detail and link to it here so people can understand better what
                // is going on and how to avoid it.
                "You are trying to block a POP navigation to a location that was not created by the history library. The block will fail silently in production, but in general you should do all navigation with the history library (instead of using window.history.pushState directly) to avoid this situation."
              )
            : void 0;
        }
      } else {
        applyTx(nextAction);
      }
    }
  }
  window2.addEventListener(PopStateEventType, handlePop);
  var action = Action.Pop;
  var _getIndexAndLocation2 = getIndexAndLocation(),
    index = _getIndexAndLocation2[0],
    location2 = _getIndexAndLocation2[1];
  var listeners = createEvents();
  var blockers = createEvents();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(
      _extends({}, globalHistory.state, {
        idx: index,
      }),
      ""
    );
  }
  function createHref(to) {
    return typeof to === "string" ? to : createPath(to);
  }
  function getNextLocation(to, state) {
    if (state === void 0) {
      state = null;
    }
    return readOnly(
      _extends(
        {
          pathname: location2.pathname,
          hash: "",
          search: "",
        },
        typeof to === "string" ? parsePath(to) : to,
        {
          state,
          key: createKey(),
        }
      )
    );
  }
  function getHistoryStateAndUrl(nextLocation, index2) {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index2,
      },
      createHref(nextLocation),
    ];
  }
  function allowTx(action2, location3, retry) {
    return (
      !blockers.length ||
      (blockers.call({
        action: action2,
        location: location3,
        retry,
      }),
      false)
    );
  }
  function applyTx(nextAction) {
    action = nextAction;
    var _getIndexAndLocation3 = getIndexAndLocation();
    index = _getIndexAndLocation3[0];
    location2 = _getIndexAndLocation3[1];
    listeners.call({
      action,
      location: location2,
    });
  }
  function push(to, state) {
    var nextAction = Action.Push;
    var nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }
    if (allowTx(nextAction, nextLocation, retry)) {
      var _getHistoryStateAndUr = getHistoryStateAndUrl(
          nextLocation,
          index + 1
        ),
        historyState = _getHistoryStateAndUr[0],
        url = _getHistoryStateAndUr[1];
      try {
        globalHistory.pushState(historyState, "", url);
      } catch (error) {
        window2.location.assign(url);
      }
      applyTx(nextAction);
    }
  }
  function replace(to, state) {
    var nextAction = Action.Replace;
    var nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }
    if (allowTx(nextAction, nextLocation, retry)) {
      var _getHistoryStateAndUr2 = getHistoryStateAndUrl(nextLocation, index),
        historyState = _getHistoryStateAndUr2[0],
        url = _getHistoryStateAndUr2[1];
      globalHistory.replaceState(historyState, "", url);
      applyTx(nextAction);
    }
  }
  function go(delta) {
    globalHistory.go(delta);
  }
  var history = {
    get action() {
      return action;
    },
    get location() {
      return location2;
    },
    createHref,
    push,
    replace,
    go,
    back: function back() {
      go(-1);
    },
    forward: function forward() {
      go(1);
    },
    listen: function listen(listener) {
      return listeners.push(listener);
    },
    block: function block(blocker) {
      var unblock = blockers.push(blocker);
      if (blockers.length === 1) {
        window2.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }
      return function () {
        unblock();
        if (!blockers.length) {
          window2.removeEventListener(
            BeforeUnloadEventType,
            promptBeforeUnload
          );
        }
      };
    },
  };
  return history;
}
function promptBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = "";
}
function createEvents() {
  var handlers = [];
  return {
    get length() {
      return handlers.length;
    },
    push: function push(fn) {
      handlers.push(fn);
      return function () {
        handlers = handlers.filter(function (handler) {
          return handler !== fn;
        });
      };
    },
    call: function call(arg) {
      handlers.forEach(function (fn) {
        return fn && fn(arg);
      });
    },
  };
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function createPath(_ref) {
  var _ref$pathname = _ref.pathname,
    pathname = _ref$pathname === void 0 ? "/" : _ref$pathname,
    _ref$search = _ref.search,
    search = _ref$search === void 0 ? "" : _ref$search,
    _ref$hash = _ref.hash,
    hash = _ref$hash === void 0 ? "" : _ref$hash;
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  var parsedPath = {};
  if (path) {
    var hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    var searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}

// ../src/history.js
var appHistory =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
    ? createBrowserHistory()
    : null;
var history_default = appHistory;

// ../src/scroll.js
var SCROLL_KEY = "scroll";
var getScrollPosition = () => ({
  y: window.pageYOffset || document.documentElement.scrollTop || 0,
  x: window.pageXOffset || document.documentElement.scrollLeft || 0,
});
var currentKey = () => {
  const { pathname, search } = window.location;
  return `${pathname}${search || ""}`;
};
var readStore = () => {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const blob = sessionStorage.getItem(SCROLL_KEY);
    return blob ? JSON.parse(blob) : {};
  } catch {
    return {};
  }
};
var writeStore = (obj) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch {}
};
var setScrollToSessionStorage = () => {
  const store = readStore();
  store[currentKey()] = getScrollPosition();
  writeStore(store);
};
var getScrollFromSessionStorage = (key = "*") => {
  const store = readStore();
  if (key === "*") return store;
  return store[key] || null;
};

// ../src/helper.js
var import_path_to_regexp = __toESM(require_dist());
import React from "react";
var Generic404 = () =>
  /* @__PURE__ */ React.createElement(
    "div",
    { style: { padding: 24 } },
    /* @__PURE__ */ React.createElement("h1", null, "404"),
    /* @__PURE__ */ React.createElement("p", null, "Page not found")
  );
var matchOne = (preparedRoutes, location2) => {
  for (const r of preparedRoutes) {
    const res = r.matcher(location2);
    if (res) {
      return { route: r, params: res.params || {} };
    }
  }
  return null;
};
var helper_default = {
  match: (preparedRoutes, location2) => {
    const m = matchOne(preparedRoutes, location2);
    if (!m) return { Component: Generic404, reducerKey: null, params: {} };
    const { route, params } = m;
    const { Component, reducerKey } = route;
    return { Component, reducerKey, params };
  },
  prepare: (routesMap2) =>
    Object.keys(routesMap2).map((path) => {
      const defn = routesMap2[path];
      let component, reducerKey;
      if (Array.isArray(defn)) {
        [component, reducerKey] = defn;
      } else {
        component = defn;
      }
      return {
        path,
        matcher: (0, import_path_to_regexp.match)(path, {
          decode: decodeURIComponent,
        }),
        Component: component,
        reducerKey: reducerKey || null,
      };
    }),
};

// ../src/handleHistoryChange.js
var import_nprogress = __toESM(require_nprogress());

// ../node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    "-" +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    "-" +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    "-" +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    "-" +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

// ../node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error(
        "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
      );
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// ../node_modules/uuid/dist/esm-browser/native.js
var randomUUID =
  typeof crypto !== "undefined" &&
  crypto.randomUUID &&
  crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// ../node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = (rnds[6] & 15) | 64;
  rnds[8] = (rnds[8] & 63) | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// ../src/handleHistoryChange.js
var inFlight = null;
var registered = false;
var defaultDeps = () => ({
  history: history_default,
  fetchImpl: typeof fetch !== "undefined" ? fetch.bind(window) : null,
  setTitle: (s) => {
    if (typeof document !== "undefined") document.title = s || "";
  },
  progress: {
    start: () => import_nprogress.default.start(),
    done: () => import_nprogress.default.done(),
  },
});
var buildRequestUrl = (loc) => {
  const origin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "http://localhost";
  const url = new URL((loc.pathname || "/") + (loc.search || ""), origin);
  url.searchParams.set("uuid", v4_default());
  return url.toString();
};
var interpretStatus = (status) => {
  const klass = Math.trunc(status / 100);
  if (klass === 5) return "5xx";
  if (status === 404) return "404";
  return "ok";
};
function handleHistoryChange(dispatch, deps = defaultDeps()) {
  const { history, fetchImpl, setTitle, progress } = deps;
  if (registered || !history || !fetchImpl) return;
  registered = true;
  history.listen(async ({ location: location2, action }) => {
    if (inFlight) {
      try {
        inFlight.abort();
      } catch {}
      inFlight = null;
    }
    progress.done();
    progress.start();
    const controller = new AbortController();
    inFlight = controller;
    const reqUrl = buildRequestUrl(location2);
    let res;
    try {
      const r = await fetchImpl(reqUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const data = await r.json().catch(() => ({}));
      res = { status: r.status, data };
    } catch (e) {
      res = { status: 503, data: {} };
    } finally {
      progress.done();
    }
    let effectiveLocation = location2.pathname;
    if (res?.data?.authorization?.location) {
      effectiveLocation = res.data.authorization.location;
    }
    const statusKind = interpretStatus(res.status);
    if (statusKind === "5xx") {
      dispatch({
        type: "CHANGE_PAGE",
        data: { ...res.data, location: "/500" },
      });
    } else if (statusKind === "404") {
      dispatch({
        type: "CHANGE_PAGE",
        data: { ...res.data, location: "/404" },
      });
    } else {
      dispatch({
        type: "CHANGE_PAGE",
        data: { ...res.data, location: effectiveLocation },
      });
    }
    setTitle(res?.data?.title || "");
    if (action === "PUSH") {
      window.scrollTo(0, 0);
    } else {
      const key = (location2.pathname || "/") + (location2.search || "");
      const previous = getScrollFromSessionStorage(key);
      if (previous) {
        setTimeout(
          () => window.scrollTo(previous.x || 0, previous.y || 0),
          250
        );
      }
    }
  });
}

// ../src/router.js
var handleSyncRegistered = false;
var Link = ({
  to,
  className,
  children,
  mode = "push",
  onMouseEnter,
  onMouseLeave,
  style = {},
  ...rest
}) => {
  const onClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }
    e.preventDefault();
    setScrollToSessionStorage();
    if (!history_default) return;
    if (mode === "replace") {
      history_default.replace(to);
    } else {
      history_default.push(to);
    }
  };
  return /* @__PURE__ */ React2.createElement(
    "a",
    {
      href: to,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      style,
      ...rest,
    },
    children
  );
};
var createRouter = ({
  routesMap: routesMap2,
  reducer: reducer2,
  initialState: initialState2 = {},
}) => {
  const preparedRoutes = helper_default.prepare(routesMap2);
  const RouterView = () => {
    const [state, dispatch] = React2.useReducer(reducer2, {
      ...initialState2,
      location:
        (history_default &&
          history_default.location.pathname +
            (history_default.location.search || "")) ||
        "/",
    });
    React2.useEffect(() => {
      if (!history_default) return;
      const unlisten = history_default.listen(({ location: location2 }) => {
        const nextLoc = location2.pathname + (location2.search || "");
        dispatch({ type: "LOCATION_CHANGED", location: nextLoc });
      });
      dispatch({
        type: "LOCATION_CHANGED",
        location:
          history_default.location.pathname +
          (history_default.location.search || ""),
      });
      return () => unlisten();
    }, []);
    React2.useEffect(() => {
      if (!handleSyncRegistered && dispatch) {
        handleHistoryChange(dispatch);
        handleSyncRegistered = true;
      }
    }, [dispatch]);
    const pathOnly = (state.location || "/").split("?", 1)[0];
    const { Component, params } = helper_default.match(
      preparedRoutes,
      pathOnly
    );
    return /* @__PURE__ */ React2.createElement(Component, {
      ...state,
      params,
      dispatch,
    });
  };
  return RouterView;
};

// routes.js
import React3 from "react";
var Home = (props) => {
  return /* @__PURE__ */ React3.createElement(
    "div",
    { style: { padding: 24 } },
    /* @__PURE__ */ React3.createElement("h1", null, "Home"),
    /* @__PURE__ */ React3.createElement(
      "p",
      null,
      "This is a tiny demo using the modernized router."
    ),
    /* @__PURE__ */ React3.createElement(
      "nav",
      { style: { display: "flex", gap: 12 } },
      /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"),
      /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About"),
      /* @__PURE__ */ React3.createElement(Link, { to: "/users/42" }, "User 42")
    ),
    /* @__PURE__ */ React3.createElement(
      "pre",
      { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } },
      JSON.stringify({ state: props }, null, 2)
    )
  );
};
var About = (props) => {
  return /* @__PURE__ */ React3.createElement(
    "div",
    { style: { padding: 24 } },
    /* @__PURE__ */ React3.createElement("h1", null, "About"),
    /* @__PURE__ */ React3.createElement(
      "p",
      null,
      "Try navigating with modifier keys to open in a new tab."
    ),
    /* @__PURE__ */ React3.createElement(
      "nav",
      { style: { display: "flex", gap: 12 } },
      /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"),
      /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About"),
      /* @__PURE__ */ React3.createElement(
        Link,
        { to: "/users/123" },
        "User 123"
      )
    ),
    /* @__PURE__ */ React3.createElement(
      "pre",
      { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } },
      JSON.stringify({ state: props }, null, 2)
    )
  );
};
var User = ({ params, ...props }) => {
  return /* @__PURE__ */ React3.createElement(
    "div",
    { style: { padding: 24 } },
    /* @__PURE__ */ React3.createElement("h1", null, "User"),
    /* @__PURE__ */ React3.createElement(
      "p",
      null,
      "User ID: ",
      /* @__PURE__ */ React3.createElement("strong", null, params.id)
    ),
    /* @__PURE__ */ React3.createElement(
      "nav",
      { style: { display: "flex", gap: 12 } },
      /* @__PURE__ */ React3.createElement(Link, { to: "/" }, "Home"),
      /* @__PURE__ */ React3.createElement(Link, { to: "/about" }, "About")
    ),
    /* @__PURE__ */ React3.createElement(
      "pre",
      { style: { background: "#f6f8fa", padding: 12, marginTop: 16 } },
      JSON.stringify({ params, state: props }, null, 2)
    )
  );
};
var routesMap = {
  "/": Home,
  "/about": About,
  "/users/:id": User,
};
var routes_default = routesMap;

// reducer.js
var initialState = {
  location: "/",
  title: "Demo",
  pageData: {},
};
function reducer(state, action) {
  switch (action.type) {
    case "LOCATION_CHANGED": {
      return { ...state, location: action.location };
    }
    case "CHANGE_PAGE": {
      const next = { ...state, ...action.data };
      if (action.data && action.data.location) {
        next.location = action.data.location;
      }
      return next;
    }
    default:
      return state;
  }
}

// app.js
installMockFetch();
var AppRouter = createRouter({
  routesMap: routes_default,
  reducer,
  initialState,
});
var root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React4.createElement(AppRouter, null));
/*! Bundled license information:

nprogress/nprogress.js:
  (* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
   * @license MIT *)
*/
//# sourceMappingURL=bundle.js.map
