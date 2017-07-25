import { Link, navigate, createRouter } from './router.js';
import AuthorizationComponent from './AuthorizationComponent.js';
import helper from './helper.js';
import { pageReducer } from './reducer.js';
import { CHANGE_PAGE, CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH, changePage, changePageError, changePageAuth } from './action.js';

export {
  Link: Link,
  navigate: navigate,
  createRouter: createRouter,
  AuthorizationComponent: AuthorizationComponent,
  helper: helper,
  pageReducer: pageReducer,
  actions: { CHANGE_PAGE, CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH, changePage, changePageError, changePageAuth }
};
