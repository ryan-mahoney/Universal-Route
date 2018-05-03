import { Link, navigate, createRouter } from "./router";
import helper from "./helper";
import { reducer } from "./reducer";
import {
  CHANGE_PAGE,
  CHANGE_PAGE_ERROR,
  CHANGE_PAGE_AUTH,
  changePage,
  changePageError,
  changePageAuth
} from "./action";

module.exports = {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter,
  routesHelper: helper,
  pageReducer: reducer,
  routerActions: {
    CHANGE_PAGE,
    CHANGE_PAGE_ERROR,
    CHANGE_PAGE_AUTH,
    changePage,
    changePageError,
    changePageAuth
  }
};
