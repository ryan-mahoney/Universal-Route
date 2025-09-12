"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;
exports.match = match;
exports.parse = parse;
exports.pathToRegexp = pathToRegexp;
exports.regexpToFunction = regexpToFunction;
exports.tokensToFunction = tokensToFunction;
exports.tokensToRegexp = tokensToRegexp;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Tokenize input string.
 */
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var _char = str[i];
    if (_char === "*" || _char === "+" || _char === "?") {
      tokens.push({
        type: "MODIFIER",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (_char === "\\") {
      tokens.push({
        type: "ESCAPED_CHAR",
        index: i++,
        value: str[i++]
      });
      continue;
    }
    if (_char === "{") {
      tokens.push({
        type: "OPEN",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (_char === "}") {
      tokens.push({
        type: "CLOSE",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (_char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
        // `0-9`
        code >= 48 && code <= 57 ||
        // `A-Z`
        code >= 65 && code <= 90 ||
        // `a-z`
        code >= 97 && code <= 122 ||
        // `_`
        code === 95) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({
        type: "NAME",
        index: i,
        value: name
      });
      i = j;
      continue;
    }
    if (_char === "(") {
      var count = 1;
      var pattern = "";
      var _j = i + 1;
      if (str[_j] === "?") {
        throw new TypeError("Pattern cannot start with \"?\" at ".concat(_j));
      }
      while (_j < str.length) {
        if (str[_j] === "\\") {
          pattern += str[_j++] + str[_j++];
          continue;
        }
        if (str[_j] === ")") {
          count--;
          if (count === 0) {
            _j++;
            break;
          }
        } else if (str[_j] === "(") {
          count++;
          if (str[_j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(_j));
          }
        }
        pattern += str[_j++];
      }
      if (count) throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern) throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({
        type: "PATTERN",
        index: i,
        value: pattern
      });
      i = _j;
      continue;
    }
    tokens.push({
      type: "CHAR",
      index: i,
      value: str[i++]
    });
  }
  tokens.push({
    type: "END",
    index: i,
    value: ""
  });
  return tokens;
}

/**
 * Parse a string for the raw tokens.
 */
function parse(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var tokens = lexer(str);
  var _options$prefixes = options.prefixes,
    prefixes = _options$prefixes === void 0 ? "./" : _options$prefixes,
    _options$delimiter = options.delimiter,
    delimiter = _options$delimiter === void 0 ? "/#?" : _options$delimiter;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function tryConsume(type) {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  };
  var mustConsume = function mustConsume(type) {
    var value = tryConsume(type);
    if (value !== undefined) return value;
    var _tokens$i = tokens[i],
      nextType = _tokens$i.type,
      index = _tokens$i.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function consumeText() {
    var result = "";
    var value;
    while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result += value;
    }
    return result;
  };
  var isSafe = function isSafe(value) {
    var _iterator = _createForOfIteratorHelper(delimiter),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _char2 = _step.value;
        if (value.indexOf(_char2) > -1) return true;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return false;
  };
  var safePattern = function safePattern(prefix) {
    var prev = result[result.length - 1];
    var prevText = prefix || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError("Must have text between two parameters, missing text after \"".concat(prev.name, "\""));
    }
    if (!prevText || isSafe(prevText)) return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var _char3 = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = _char3 || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix: prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = _char3 || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var _prefix = consumeText();
      var _name = tryConsume("NAME") || "";
      var _pattern = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: _name || (_pattern ? key++ : ""),
        pattern: _name && !_pattern ? safePattern(_prefix) : _pattern,
        prefix: _prefix,
        suffix: suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}

/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
  return tokensToFunction(parse(str, options), options);
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var reFlags = flags(options);
  var _options$encode = options.encode,
    encode = _options$encode === void 0 ? function (x) {
      return x;
    } : _options$encode,
    _options$validate = options.validate,
    validate = _options$validate === void 0 ? true : _options$validate;

  // Compile all the tokens into regexps.
  var matches = tokens.map(function (token) {
    if ((0, _typeof2["default"])(token) === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function (data) {
    var path = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path += token;
        continue;
      }
      var value = data ? data[token.name] : undefined;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
        }
        if (value.length === 0) {
          if (optional) continue;
          throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
          }
          path += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var _segment = encode(String(value), token);
        if (validate && !matches[i].test(_segment)) {
          throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(_segment, "\""));
        }
        path += token.prefix + _segment + token.suffix;
        continue;
      }
      if (optional) continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
    }
    return path;
  };
}

/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}

/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$decode = options.decode,
    decode = _options$decode === void 0 ? function (x) {
      return x;
    } : _options$decode;
  return function (pathname) {
    var m = re.exec(pathname);
    if (!m) return false;
    var path = m[0],
      index = m.index;
    var params = Object.create(null);
    var _loop = function _loop() {
      if (m[i] === undefined) return 1; // continue
      var key = keys[i - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      if (_loop()) continue;
    }
    return {
      path: path,
      index: index,
      params: params
    };
  };
}

/**
 * Escape a regular expression string.
 */
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}

/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
  return options && options.sensitive ? "" : "i";
}

/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
  if (!keys) return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}

/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function (path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}

/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$strict = options.strict,
    strict = _options$strict === void 0 ? false : _options$strict,
    _options$start = options.start,
    start = _options$start === void 0 ? true : _options$start,
    _options$end = options.end,
    end = _options$end === void 0 ? true : _options$end,
    _options$encode2 = options.encode,
    encode = _options$encode2 === void 0 ? function (x) {
      return x;
    } : _options$encode2,
    _options$delimiter2 = options.delimiter,
    delimiter = _options$delimiter2 === void 0 ? "/#?" : _options$delimiter2,
    _options$endsWith = options.endsWith,
    endsWith = _options$endsWith === void 0 ? "" : _options$endsWith;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";

  // Iterate over the tokens and create our regexp string.
  var _iterator2 = _createForOfIteratorHelper(tokens),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var token = _step2.value;
      if (typeof token === "string") {
        route += escapeString(encode(token));
      } else {
        var prefix = escapeString(encode(token.prefix));
        var suffix = escapeString(encode(token.suffix));
        if (token.pattern) {
          if (keys) keys.push(token);
          if (prefix || suffix) {
            if (token.modifier === "+" || token.modifier === "*") {
              var mod = token.modifier === "*" ? "?" : "";
              route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
            } else {
              route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
            }
          } else {
            if (token.modifier === "+" || token.modifier === "*") {
              throw new TypeError("Can not repeat \"".concat(token.name, "\" without a prefix and suffix"));
            }
            route += "(".concat(token.pattern, ")").concat(token.modifier);
          }
        } else {
          route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
        }
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  if (end) {
    if (!strict) route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === undefined;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}