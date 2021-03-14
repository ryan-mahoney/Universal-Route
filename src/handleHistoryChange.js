import appHistory from "./history";
import nprogress from "nprogress";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getScrollFromSessionStorage, setScrollToSessionStorage } from "./scroll";

// initialize a place-holder for the last request cancellation token
let requestCancellation = false;
let lastLocation = null;

export default dispatch => {
  // handle server rendered case
  if (!appHistory) {
    return;
  }

  // listen for changes to the current location
  appHistory.listen(async historyEvent => {
    const { location, action } = historyEvent;

    // set scroll position for replace
    if (action == "REPLACE") {
      setScrollToSessionStorage();
    }

    // determine if location actually change, ignoring hash changes
    const check = `${location.state ? `${location.state}:` : ""}${location.pathname}${
      location.search ? `?${location.search}` : ""
    }`;
    if (check === lastLocation && location.hash !== "") {
      return;
    }
    lastLocation = check;

    // clear and start
    nprogress.done();
    nprogress.start();

    // decide which path to call
    const uuid = uuidv4();
    let path = `${location.pathname}${location.search}${location.search.indexOf("?") !== -1 ? "&" : "?"}uuid=${uuid}`;

    // do XHR request
    const CancelToken = axios.CancelToken;
    if (requestCancellation) {
      requestCancellation.cancel("Override a previous request");
    }
    requestCancellation = CancelToken.source();
    const response = await axios
      .get(path, {
        cancelToken: requestCancellation.token,
        headers: {
          "Content-Type": "application/json"
        }
      })
      .catch(error => {
        return error.response || null;
      });

    // stop displaying progress bar
    nprogress.done();

    // if there was not response, do nothing
    if (response === null) {
      return;
    }

    // handle 500 error
    if (response.status[0] == 5) {
      dispatch({
        type: "CHANGE_PAGE",
        data: { ...response.data, location: "/500" }
      });
      return;
    }

    if (response.status == 404) {
      dispatch({
        type: "CHANGE_PAGE",
        data: { ...response.data, location: "/404" }
      });
      return;
    }

    let data = { ...response.data, location: location.pathname };

    // handle authorization based redirection
    if (response.data.authorization) {
      data.location = response.data.authorization.location ? response.data.authorization.location : "/unauthorized";
    }

    // call change page action to trigger re-rendering
    dispatch({ type: "CHANGE_PAGE", data });

    // set page title
    document.title = response.data.title ? response.data.title : "";

    if (action == "PUSH") {
      window.scrollTo(0, 0);
    } else {
      const previousScroll = getScrollFromSessionStorage(window.location.pathname);
      if (previousScroll) {
        setTimeout(() => {
          window.scrollTo(previousScroll.x, previousScroll.y);
        }, 250);
      }
    }
  });
};
