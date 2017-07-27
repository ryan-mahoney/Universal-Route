import { CHANGE_PAGE, CHANGE_PAGE_ERROR, CHANGE_PAGE_AUTH } from './action.js';

export const pageReducer = (currentState, action) => {
  switch (action.type) {
    case CHANGE_PAGE:
      return Object.assign({}, currentState, {
        page: action.page,
        error: null,
        auth: null
      });

    case CHANGE_PAGE_ERROR:
      return Object.assign({}, currentState, {
        page: null,
        error: action.error,
        auth: null
      });

    case CHANGE_PAGE_AUTH:
      return Object.assign({}, currentState, {
        page: null,
        error: null,
        auth: action.auth
      });

    default:
      return currentState;
  }
};
