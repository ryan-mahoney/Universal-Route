import {CHANGE_PAGE} from "./action.js";

export const reducer = (currentState = {location: "/", error: null}, action) => {
  switch (action.type) {
    case CHANGE_PAGE:
      return action.data;

    default:
      return currentState;
  }
};
