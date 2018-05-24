import createHistory from "history/createBrowserHistory";

// create app history if possible, as singleton
const appHistory =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
    ? createHistory()
    : false;

export default appHistory;
