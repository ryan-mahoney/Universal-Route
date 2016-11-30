
export const CHANGE_HISTORY = 'CHANGE_HISTORY';
export const CHANGE_HISTORY = 'CHANGE_HISTORY_ERROR';

export const changeHistory = (response) => ({
    type: CHANGE_HISTORY,
    payload: response
});

export const changeHistoryError = (error) => ({
    type: CHANGE_HISTORY_ERROR,
    payload: error
});
