import component from './component.js';
import helper from './helper.js';
import reducer from './reducer.js';
import { CHANGE_HISTORY, changeHistory, CHANGE_HISTORY_ERROR, changeHistoryError } from './action.js';

const actions = {
    CHANGE_HISTORY,
    changeHistory,
    CHANGE_HISTORY_ERROR,
    changeHistoryError
};

export {
    component,
    helper,
    reducer,
    actions
};
