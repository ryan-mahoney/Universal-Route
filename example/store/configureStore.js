import { createStore, combineReducers } from 'redux';
import { reducer } from './../../src/reducer.js';

const rootReducer = combineReducers({
  page: reducer
});

const configureStore = (preloadedState) => {
  const store = createStore(
    rootReducer,
    preloadedState
  );

  return store;
};

export default configureStore;
