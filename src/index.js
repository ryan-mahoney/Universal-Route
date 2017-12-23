import {Link, navigate, createRouter} from "./router.js";
import helper from "./helper.js";
import {reducer} from "./reducer.js";
import {CHANGE_PAGE, CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH, changePage, changePageError, changePageAuth} from "./action.js";

module.exports = {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter,
  routesHelper: helper,
  pageReducer: reducer,
  routerActions: {CHANGE_PAGE, CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH, changePage, changePageError, changePageAuth}
};
