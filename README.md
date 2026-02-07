# Universal Route

A lightweight, type-safe routing library for React. Universal Route keeps your UI in sync with the URL without the overhead of a full-stack framework — ideal for small-to-medium projects that want to stay frameworkless.

## Install

```bash
npm install @ryanfw/universal-route
```

Peer dependencies: `react >= 19.1.1`

## Quick Start

```tsx
// routes.ts
import Home from "./components/Home";
import About from "./components/About";
import User from "./components/User";

export default {
  "/": Home,
  "/about": About,
  "/users/:id": User,
};
```

```tsx
// app.tsx
import { createContext, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { createRouter } from "@ryanfw/universal-route";
import routes from "./routes";

const StateContext = createContext({ state: {}, dispatch: false as any });

function StateProvider({ children }) {
  const [state, dispatch] = useReducer((s, a) => {
    if (a.type === "LOCATION_CHANGED") return { ...s, location: a.location };
    return s;
  }, { location: "/" });

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
}

const AppRouter = createRouter(routes, StateContext);

createRoot(document.getElementById("root")!).render(
  <StateProvider>
    <AppRouter />
  </StateProvider>
);
```

That's it. The router matches the URL to a component, renders it, and dispatches `LOCATION_CHANGED` to your reducer when the user navigates.

## Usage Modes

Universal Route supports two modes depending on whether your app loads page data from a server.

### Client-Side Only

Use this when your components manage their own data (local state, hooks, etc.) and don't need the router to fetch anything on navigation.

**What happens:** URL changes → router swaps the component → dispatches `LOCATION_CHANGED` with the new path. No network requests.

Your reducer handles one action:

```ts
case "LOCATION_CHANGED":
  return { ...state, location: action.location };
```

### Server-Integrated

Use this when your app fetches page data from an API on every navigation — for example, a server that returns JSON with a page title, component data, and authorization status.

Wire it up with `handleHistoryChange`:

```tsx
import { useEffect } from "react";
import {
  handleHistoryChange,
  appHistory,
} from "@ryanfw/universal-route";
import NProgress from "nprogress";

function App() {
  const { dispatch } = useContext(StateContext);

  useEffect(() => {
    return handleHistoryChange(dispatch, {
      history: appHistory,
      fetchImpl: fetch,
      setTitle: (t) => { document.title = t; },
      progress: NProgress,
    });
  }, [dispatch]);

  return <AppRouter />;
}
```

**What happens on each navigation:**

1. Starts the progress indicator
2. Fetches the current URL as JSON (with cache-busting)
3. Aborts any in-flight request from a previous navigation
4. Dispatches `CHANGE_PAGE` with the response data
5. Sets the document title if the response includes `title`
6. Scrolls to top on push, restores scroll position on back/forward

**Your reducer handles two actions:**

```ts
case "LOCATION_CHANGED":
  return { ...state, location: action.location };

case "CHANGE_PAGE":
  return { ...state, ...action.data };
```

**Error and redirect handling:**

- `404` response → dispatches with `location: "/404"`
- `5xx` response → dispatches with `location: "/500"`
- Response with `{ authorization: { location: "/login" } }` → dispatches with that location (auth redirects take priority)

## API Reference

### `createRouter(routes, storeContext?)`

Creates a React component that renders the matched route.

```ts
const AppRouter = createRouter(routes, StateContext);
```

- `routes` — a route map or array (see [Route Patterns](#route-patterns))
- `storeContext` — optional React Context providing `{ state, dispatch }`

The router does **not** dispatch on initial mount (it assumes your store is already hydrated). It dispatches `LOCATION_CHANGED` only when the location actually changes.

### `Link`

Client-side navigation link. Renders an `<a>` element.

```tsx
import { Link } from "@ryanfw/universal-route";

<Link to="/about">About</Link>
<Link to={{ pathname: "/users/42", search: "?tab=profile", hash: "#bio" }}>Profile</Link>
<Link to="/home" replace>Home</Link>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `to` | `string \| { pathname, search?, hash? }` | Destination (required) |
| `replace` | `boolean` | Replace history entry instead of push |
| `state` | `unknown` | State to pass with navigation |

Passes through all standard `<a>` attributes (`className`, `style`, etc.).

Link intercepts left-clicks for client-side navigation. It falls back to browser default behavior for modifier keys (Cmd/Ctrl/Shift/Alt), non-left clicks, external URLs, and links with `target` or `download` attributes.

### `navigate(to, options?)`

Navigate programmatically.

```ts
import { navigate } from "@ryanfw/universal-route";

navigate("/dashboard");
navigate("/login", { replace: true, state: { from: "/protected" } });
```

Throws if called in a non-browser environment without an active history — use `makeMemoryHistory` for SSR or testing.

### `routesHelper.prepare(routes)`

Normalizes route definitions and compiles path matchers. Called internally by `createRouter`, but useful if you need to match routes outside the component tree.

```ts
import { routesHelper } from "@ryanfw/universal-route";

const prepared = routesHelper.prepare({
  "/": Home,
  "/users/:id": [User, "users"],     // [Component, reducerKey]
  "/docs/:path+": Docs,
});
```

Accepts routes as an object map or an array of `{ path, Component, reducerKey? }`.

### `routesHelper.match(routes, pathname)`

Returns the first matching route for a pathname.

```ts
const result = routesHelper.match(prepared, "/users/42");
// { Component: User, params: { id: "42" }, reducerKey: "users" }
```

Returns a built-in 404 component if nothing matches and no catch-all is defined.

### `handleHistoryChange(dispatch, options?)`

Listens for history changes and coordinates fetching, dispatching, title updates, and scroll restoration. Returns a cleanup function.

```ts
const cleanup = handleHistoryChange(dispatch, {
  history,      // BrowserHistory instance (default: appHistory)
  fetchImpl,    // fetch function or null to disable (default: global fetch)
  setTitle,     // (title: string) => void (default: sets document.title)
  progress,     // { start(), done() } (default: no-ops)
});
```

Returns a no-op if `history` or `fetchImpl` is null. Guards against double-installation on the same history instance.

### `appHistory` / `makeMemoryHistory`

```ts
import { appHistory, makeMemoryHistory } from "@ryanfw/universal-route";
```

- `appHistory` — singleton `BrowserHistory` instance (null in non-browser environments)
- `makeMemoryHistory(initialEntries?)` — creates an in-memory history for testing or SSR

```ts
const mem = makeMemoryHistory(["/"]);
mem.push("/about");
mem.listen(({ location, action }) => { /* ... */ });
```

### Scroll Utilities

```ts
import {
  getScrollPosition,
  setScrollToSessionStorage,
  setScrollForKey,
  getScrollFromSessionStorage,
} from "@ryanfw/universal-route";
```

| Function | Description |
|----------|-------------|
| `getScrollPosition()` | Returns current `{ x, y }` scroll position |
| `setScrollToSessionStorage()` | Saves current scroll position keyed by current URL |
| `setScrollForKey(key, pos?)` | Saves scroll position for a specific URL key |
| `getScrollFromSessionStorage(key?)` | Retrieves a saved position, or all positions with `"*"` |

Scroll positions are stored in `sessionStorage` with a max of 100 entries (oldest evicted first).

## Route Patterns

Routes use path pattern syntax inspired by [path-to-regexp](https://github.com/pillarjs/path-to-regexp):

| Pattern | Example URL | Params |
|---------|-------------|--------|
| `/about` | `/about` | `{}` |
| `/users/:id` | `/users/42` | `{ id: "42" }` |
| `/docs/:path+` | `/docs/api/reference` | `{ path: "api/reference" }` |
| `*` | anything | `{}` |

- `:param` matches a single path segment
- `:param+` matches one or more segments (rest/splat parameter)
- `*` or `/*` matches any path — place it last as a catch-all
- Parameters are automatically URL-decoded

Routes are matched in definition order. First match wins.

Routes can be defined as an object map or an array:

```ts
// Object map
const routes = {
  "/": Home,
  "/users/:id": [User, "users"],              // with reducerKey
  "/settings": { Component: Settings },        // object form
  "*": NotFound,
};

// Array
const routes = [
  { path: "/", element: Home },
  { path: "/users/:id", Component: User, reducerKey: "users" },
  { path: "*", element: NotFound },
];
```

Component aliases `Component`, `element`, and `render` are all supported.

## Demo

The repo includes a working demo with mock server responses:

```bash
git clone https://github.com/ryan-mahoney/Universal-Route.git
cd Universal-Route
npm install
npm run demo
```

## License

MIT
