import { createStore } from 'redux';
import { pageReducer } from './../../src/reducer.js';

const configureStore = (preloadedState) => {
  const store = createStore(
    pageReducer,
    preloadedState
  );

  return store;
};

export default configureStore;
