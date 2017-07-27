import { createStore } from 'redux';
import { reducer } from './../../src/reducer.js';

const configureStore = (preloadedState) => {
  const store = createStore(
    reducer,
    preloadedState
  );

  return store;
};

export default configureStore;
