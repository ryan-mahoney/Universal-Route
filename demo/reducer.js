export const initialState = {
  location: "/",
  title: "Demo",
  pageData: {}
};

export default function reducer(state, action) {
  switch (action.type) {
    case "LOCATION_CHANGED": {
      return { ...state, location: action.location };
    }
    case "CHANGE_PAGE": {
      const next = { ...state, ...action.data };
      // ensure location is in state for components
      if (action.data && action.data.location) {
        next.location = action.data.location;
      }
      return next;
    }
    default:
      return state;
  }
}
