import appHistory from "./history";
import nprogress from "nprogress";
import axios from "axios";
import {
  getScrollPosition,
  getScrollFromSessionStorage,
  setScrollToSessionStorage
} from "./scroll";

// initilize a place-holder for the last request cancellation token
var requestCancellation = false;

export default changePage => {
  // handle server rendered case
  if (!appHistory) {
    return;
  }

  // listen for changes to the current location
  appHistory.listen(async (location, action) => {
    // clear and start
    nprogress.done();
    nprogress.start();

    // decide which path to call
    const uuid = uuidv4();
    let path = `${location.pathname}${location.search}${
      location.search.indexOf("?") !== -1 ? "&" : "?"
    }uuid=${uuid}`;

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
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
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
      changePage(Object.assign({}, response.data, { location: "/500" }));
      return;
    }

    if (response.status == 404) {
      changePage(Object.assign({}, response.data, { location: "/404" }));
      return;
    }

    let data = Object.assign({}, response.data.page, {
      location: location.pathname
    });

    // handle authorization based redirection
    if (response.data.page.authorization) {
      data.location = response.data.page.authorization.location
        ? response.data.page.authorization.location
        : "/unauthorized";
    }

    // call change page redux action to trigger re-rendering
    changePage(data);

    // set page title
    document.title = response.data.title ? response.data.title : "";

    if (action == "PUSH") {
      window.scrollTo(0, 0);
    } else {
      const previousScroll = getScrollFromSessionStorage(
        window.location.pathname
      );
      if (previousScroll) {
        setTimeout(() => {
          window.scrollTo(previousScroll.x, previousScroll.y);
        }, 250);
      }
    }
  });
};
