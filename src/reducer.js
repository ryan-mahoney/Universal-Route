import { combineReducers } from 'redux';
import { CHANGE_HISTORY } from './action.js';

const globalReducer = (currentState = initialState, action) => {
    switch (action.type) {
    case CHANGE_HISTORY:
        return Object.assign({}, currentState, action.payload);
    default:
        return currentState;
    }
};

export default function (reducers) {

    const subReducers = combineReducers(reducers);

    return function (currentState = initialState, action) {
        var nextState = globalReducer(currentState, action);
        if (action.type == CHANGE_HISTORY) {
            return nextState;
        }
        return subReducers(nextState, action);
    };
};
