// Modernized history singleton with test-friendly exports (ESM)
import { createBrowserHistory, createMemoryHistory } from "history";

export const appHistory =
  typeof window !== "undefined" && window.document && window.document.createElement
    ? createBrowserHistory()
    : null;

export const makeMemoryHistory = (initialEntries = ["/"]) =>
  createMemoryHistory({ initialEntries });

export default appHistory;
