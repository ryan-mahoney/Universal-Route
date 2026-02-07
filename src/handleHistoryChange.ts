import type { BrowserHistory, Update } from "history";
import { getScrollFromSessionStorage, type ScrollPosition } from "./scroll";

export interface ProgressAPI {
  start(): void;
  done(): void;
}

export interface HandleHistoryChangeOptions {
  history?: BrowserHistory | null;
  fetchImpl?: ((url: string, init?: RequestInit) => Promise<Response>) | null;
  setTitle?: (title: string) => void;
  progress?: ProgressAPI;
}

const makeUuid = (): string => {
  // Browser / Workers
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    if (typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    // RFC4122 v4 via getRandomValues
    const buf = new Uint8Array(16);
    globalThis.crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = [...buf].map((b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }
  // Node
  try {
    const { randomUUID } = (globalThis as any).require("node:crypto");
    if (typeof randomUUID === "function") return randomUUID();
  } catch {}
  // Last-resort (non-crypto)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const INSTALLED = Symbol.for("handleHistoryChange:installed");
let _inFlight: AbortController | null = null;
let _latestRequestId: number = 0;

const originOf = (): string => {
  try {
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.origin
    ) {
      return window.location.origin;
    }
  } catch {}
  return "http://localhost";
};

const buildUrl = (loc: { pathname?: string; search?: string }): string => {
  const url = new URL((loc.pathname || "/") + (loc.search || ""), originOf());
  url.searchParams.set("uuid", makeUuid());
  return url.toString();
};

const kindFrom = (status: number): "ok" | "404" | "5xx" => {
  if (status === 404) return "404";
  if (Math.floor(status / 100) === 5) return "5xx";
  return "ok";
};

export default function handleHistoryChange(
  dispatch: (action: { type: string; data: Record<string, unknown> }) => void,
  {
    history,
    fetchImpl = (typeof fetch !== "undefined" && fetch) || null,
    setTitle = function (t: string): void {
      if (typeof document !== "undefined" && t) document.title = t;
    },
    progress = { start() {}, done() {} }, // optional in tests
  }: HandleHistoryChangeOptions = {},
): void {
  if (!history || !fetchImpl) {
    return;
  }

  if ((history as any)[INSTALLED]) {
    return;
  }
  (history as any)[INSTALLED] = true;

  history.listen(function ({ location, action }: Update): void {
    // Abort prior request
    if (_inFlight && typeof _inFlight.abort === "function") {
      try {
        _inFlight.abort();
      } catch {}
    }
    const requestId = ++_latestRequestId;
    _inFlight =
      typeof AbortController !== "undefined" ? new AbortController() : null;

    if (progress && typeof progress.done === "function") progress.done();
    if (progress && typeof progress.start === "function") progress.start();

    const url = buildUrl(location);

    // Single promise chain so one microtask drain should be enough in tests
    Promise.resolve(
      fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: _inFlight ? _inFlight.signal : undefined,
      }),
    )
      .then(function (res): Promise<{ status: number; data: Record<string, unknown> }> {
        const jp = res && res.json ? res.json() : {};
        return Promise.resolve(jp)
          .then(function (data) {
            return { status: res ? res.status : 503, data: (data as Record<string, unknown>) || {} };
          })
          .catch(function () {
            return { status: res ? res.status : 503, data: {} };
          });
      })
      .catch(function () {
        return { status: 503, data: {} };
      })
      .then(function ({ status, data }): void {
        if (requestId !== _latestRequestId) return;
        if (progress && typeof progress.done === "function") progress.done();

        // Authorization redirect wins
        const authLoc = (data as { authorization?: { location?: string } }).authorization
          ?.location;
        let finalLoc = authLoc || location.pathname || "/";

        // Map 404/5xx if no explicit auth redirect
        if (!authLoc) {
          const k = kindFrom(status);
          if (k === "404") finalLoc = "/404";
          else if (k === "5xx") finalLoc = "/500";
        }

        dispatch({
          type: "CHANGE_PAGE",
          data: Object.assign({}, data, { location: finalLoc }),
        });

        // Title from top-level data.title
        const title = (data as { title?: string }).title;
        if (title) {
          // eslint-disable-next-line no-console
          setTitle(title);
        }

        // Scroll behavior: top on PUSH; restore for POP/REPLACE
        if (typeof window !== "undefined" && window.scrollTo) {
          if (action === "PUSH") {
            window.scrollTo(0, 0);
          } else {
            const key = (location.pathname || "/") + (location.search || "");
            const prev: ScrollPosition | null = getScrollFromSessionStorage(key);
            if (prev) {
              setTimeout(function () {
                window.scrollTo(prev.x || 0, prev.y || 0);
              }, 250);
            }
          }
        }
      });
  });
}

// Test helpers (reset does nothing now because the guard is per-history instance)
export const __test__: {
  reset: () => void;
  state: () => { inFlight: boolean };
} = {
  reset: function (): void {},
  state: function (): { inFlight: boolean } {
    return {
      inFlight: !!_inFlight,
    };
  },
};
