# Universal Route

Universal Route is a lightweight, type-safe routing library for React.

A Router keeps your UI in sync with the URL. Universal Route is designed to be small and focused, helping small-to-medium React projects stay "frameworkless" by avoiding the overhead and complexity of larger full-stack frameworks.

### Features

- **TypeScript**: Written in TypeScript for type safety and great developer experience.
- **Lightweight**: Covers specific use cases without bloat.
- **Tested**: High test coverage for reliability.
- **Performance**: Optimized for speed with performance measurements.
- **Demo**: Includes a demo to get you started quickly.

### How it Works

- Associate [URL patterns](https://github.com/pillarjs/path-to-regexp) with a top-level React component.
- Make an XHR request on each history transition, switching the displayed component after success.
- Start / stop progress page loading indicators automatically.

### Defining Routes

routes.ts

```ts
// NPM dependencies
import React from "react";
import { helper } from "@ryanfw/universal-route";

// React component dependencies
import Home from "./components/Home";
import About from "./components/About";
import Staff from "./components/Staff";

// associate paths to components
const routes = {
  "/": Home,
  "/about": About,
  "/staff/:name": Staff,
};

// export the routes after preparing them
export default helper.prepare(routes);
```
