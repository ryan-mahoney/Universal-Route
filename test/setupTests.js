// If your project is ESM, keep this import. If it’s CJS, see Option B notes below.
import "@testing-library/jest-dom";

// Stable, no-op scrollTo for tests
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

// Simple sessionStorage polyfill
class MemoryStorage {
  constructor() {
    this._s = {};
  }
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null;
  }
  setItem(k, v) {
    this._s[k] = String(v);
  }
  removeItem(k) {
    delete this._s[k];
  }
  clear() {
    this._s = {};
  }
}
if (!("sessionStorage" in window)) {
  Object.defineProperty(window, "sessionStorage", {
    value: new MemoryStorage(),
    writable: false,
  });
}

// Default URL for JSDOM (mirrors jest.config.cjs testEnvironmentOptions.url)
// Object.defineProperty(window, "location", {
//   value: new URL("http://localhost/"),
//   writable: true,
// });

// Global mock for nprogress used by the router
jest.mock("nprogress", () => ({ start: jest.fn(), done: jest.fn() }));
