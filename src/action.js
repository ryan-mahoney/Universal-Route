
export const CHANGE_PAGE = 'CHANGE_PAGE';
export const CHANGE_PAGE_ERROR = 'CHANGE_PAGE_ERROR';
export const CHANGE_PAGE_AUTH = 'CHANGE_PAGE_AUTH';

export const changePage = (data) => ({
  type: CHANGE_PAGE,
  data: data.payload
});

export const changePageError = (error) => ({
  type: CHANGE_PAGE_ERROR,
  error: error
});

export const changePageAuth = (auth) => ({
  type: CHANGE_PAGE_AUTH,
  auth: auth
});
