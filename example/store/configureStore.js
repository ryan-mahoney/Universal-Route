import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { pageReducer } from './../../src/reducer.js';

const configureStore = (preloadedState) => {
  const store = createStore(
    pageReducer,
    preloadedState,
    applyMiddleware(thunkMiddleware)
  );

  return store;
};

export default configureStore;
