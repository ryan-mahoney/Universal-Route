import { CHANGE_PAGE } from "./../constants/action-types";

export const reducer = (
  currentState = {
    location: "/",
    error: null,
    sortState: {},
    modalKey: {}
  },
  action
) => {
  let update = {};
  switch (action.type) {
    case CHANGE_PAGE:
      return Object.assign({}, action.data);

    default:
      return currentState;
  }
};
