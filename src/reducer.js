import { combineReducers } from 'redux';
import { CHANGE_HISTORY, CHANGE_HISTORY_ERROR } from './action.js';
import authorizationReducer from './authorizationReducer.js';

const globalReducer = (currentState = initialState, action) => {
    switch (action.type) {
    case CHANGE_HISTORY:
        return Object.assign({}, currentState, action.payload);
    case CHANGE_HISTORY_ERROR:
        return Object.assign({}, currentState, {error: action.payload});
    default:
        return currentState;
    }
};

export default function (reducers) {

    const subReducers = combineReducers(Object.assign({}, reducers, {authorizationReducer});

    return function (currentState = initialState, action) {
        var nextState = globalReducer(currentState, action);
        if (action.type == CHANGE_HISTORY || action.type == CHANGE_HISTORY_ERROR) {
            return nextState;
        }
        return subReducers(nextState, action);
    };
};
