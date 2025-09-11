import appHistory from "./history.js";
import nprogress from "nprogress";
import { v4 as uuidv4 } from "uuid";
import { getScrollFromSessionStorage /*, setScrollToSessionStorage*/ } from "./scroll.js";

/**
 * Registers a single history listener that:
 *  - Cancels in-flight fetch on new navigation (AbortController)
 *  - Requests JSON for the current location (accept: application/json)
 *  - Dispatches a CHANGE_PAGE action with the response body
 *  - Handles 404/5xx by dispatching a CHANGE_PAGE to /404 or /500
 *  - Restores scroll on POP/REPLACE and scrolls to top on PUSH
 *  - Updates document.title from response.data.title
 *
 * You can inject custom deps for testing: { history, fetchImpl, setTitle, progress }
 */
let inFlight = null;
let registered = false;

const defaultDeps = () => ({
  history: appHistory,
  fetchImpl: typeof fetch !== "undefined" ? fetch.bind(window) : null,
  setTitle: (s) => {
    if (typeof document !== "undefined") document.title = s || "";
  },
  progress: {
    start: () => nprogress.start(),
    done: () => nprogress.done()
  }
});

const buildRequestUrl = (loc) => {
  const origin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "http://localhost";
  const url = new URL((loc.pathname || "/") + (loc.search || ""), origin);
  url.searchParams.set("uuid", uuidv4());
  return url.toString();
};

const interpretStatus = (status) => {
  const klass = Math.trunc(status / 100);
  if (klass === 5) return "5xx";
  if (status === 404) return "404";
  return "ok";
};

export default function handleHistoryChange(dispatch, deps = defaultDeps()) {
  const { history, fetchImpl, setTitle, progress } = deps;
  if (registered || !history || !fetchImpl) return;
  registered = true;

  history.listen(async ({ location, action }) => {
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
    const reqUrl = buildRequestUrl(location);

    let res;
    try {
      const r = await fetchImpl(reqUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      const data = await r.json().catch(() => ({}));
      res = { status: r.status, data };
    } catch (e) {
      res = { status: 503, data: {} };
    } finally {
      progress.done();
    }

    let effectiveLocation = location.pathname;
    if (res?.data?.authorization?.location) {
      effectiveLocation = res.data.authorization.location;
    }

    const statusKind = interpretStatus(res.status);
    if (statusKind === "5xx") {
      dispatch({ type: "CHANGE_PAGE", data: { ...res.data, location: "/500" } });
    } else if (statusKind === "404") {
      dispatch({ type: "CHANGE_PAGE", data: { ...res.data, location: "/404" } });
    } else {
      dispatch({ type: "CHANGE_PAGE", data: { ...res.data, location: effectiveLocation } });
    }

    setTitle(res?.data?.title || "");

    if (action === "PUSH") {
      window.scrollTo(0, 0);
    } else {
      const key = (location.pathname || "/") + (location.search || "");
      const previous = getScrollFromSessionStorage(key);
      if (previous) {
        setTimeout(() => window.scrollTo(previous.x || 0, previous.y || 0), 250);
      }
    }
  });
}
