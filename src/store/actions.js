export const SET_USERS = 'SET_USERS';
export const SET_TOTAL = 'SET_TOTAL';
export const SET_PAGE = 'SET_PAGE';
export const SET_LOADING = 'SET_LOADING';
export const TOGGLE_FOLLOW = 'TOGGLE_FOLLOW';
export const TOGGLE_HIDDEN = 'TOGGLE_HIDDEN';
export const SET_TOAST = 'SET_TOAST';

export const setUsers = (users) => ({ type: SET_USERS, payload: users });
export const setTotal = (n) => ({ type: SET_TOTAL, payload: n });
export const setPage = (p) => ({ type: SET_PAGE, payload: p });
export const setLoading = (v) => ({ type: SET_LOADING, payload: v });
export const toggleFollow = (id) => ({ type: TOGGLE_FOLLOW, payload: id });
export const toggleHidden = (id) => ({ type: TOGGLE_HIDDEN, payload: id });
export const setToast = (text) => ({ type: SET_TOAST, payload: text });