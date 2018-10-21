import { createStore, combineReducers } from "redux";
import { reducer } from "./../reducers/page-reducer";

const rootReducer = combineReducers({
  page: reducer
});

const configureStore = preloadedState => {
  const store = createStore(rootReducer, preloadedState);

  return store;
};

export default configureStore;
