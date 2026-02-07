/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/test/setupTests.js"],

  testMatch: ["**/test/**/*.(test|spec).[jt]s?(x)"],
  // Useful to keep JSDOM URL stable for URL() logic
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  moduleNameMapper: {
    "^uuid$": "<rootDir>/mocks/uuid.js", // 👈 use the mock instead of real ESM
  },
  // If you keep "type": "module" in package.json, Jest still runs tests in CJS via babel-jest
  // so ESM imports in your source are fine.
};
