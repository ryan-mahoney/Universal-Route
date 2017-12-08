import { CHANGE_PAGE } from './action.js';

export const reducer = (currentState = {location: "/", error: null}, action) => {
  switch (action.type) {
    case CHANGE_PAGE:
      return Object.assign({}, currentState, action.data);

    default:
      return currentState;
  }
};
