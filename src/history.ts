// Modernized history singleton with test-friendly exports (ESM)
import {
  createBrowserHistory,
  createMemoryHistory,
  type BrowserHistory,
  type MemoryHistory,
} from "history";

export const appHistory: BrowserHistory | null =
  typeof window !== "undefined" &&
  window.document &&
  typeof window.document.createElement === "function"
    ? createBrowserHistory()
    : null;

export const makeMemoryHistory = (initialEntries: string[] = ["/"]): MemoryHistory =>
  createMemoryHistory({ initialEntries });

export default appHistory;
