
export const CHANGE_PAGE = 'CHANGE_PAGE';
export const CHANGE_PAGE_ERROR = 'CHANGE_PAGE_ERROR';
export const CHANGE_PAGE_AUTH = 'CHANGE_PAGE_AUTH';

export const changePage = (page) => ({
  type: CHANGE_PAGE,
  page: page.payload
});

export const changePageError = (error) => ({
  type: CHANGE_PAGE_ERROR,
  error: error
});

export const changePageAuth = (auth) => ({
  type: CHANGE_PAGE_AUTH,
  auth: auth
});
