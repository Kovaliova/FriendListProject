import { 
  SET_USERS, SET_TOTAL, SET_PAGE, SET_LOADING, TOGGLE_FOLLOW, TOGGLE_HIDDEN, SET_TOAST 
} from './actions';

const persisted = JSON.parse(localStorage.getItem('mini-social') || '{}');

const initialState = {
  users: [],          // все загруженные пользователи
  total: 0,
  page: 1,
  limit: 8,
  loading: false,
  toast: '',
  follows: persisted.follows || {}, // { [id]: true|false }
  hidden: persisted.hidden || {}    // { [id]: true|false }
};

export function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USERS: {
      // сливаем новые данные с уже существующими
      const newUsers = action.payload.map(u => {
        const isFollowed = !!state.follows[u.id];
        const isHidden = !!state.hidden[u.id];
        return { ...u, isFollowed, isHidden };
      });

      // создаем мапу для уникальности по id
      const usersMap = {};
      state.users.forEach(u => usersMap[u.id] = u);
      newUsers.forEach(u => usersMap[u.id] = u);

      return { ...state, users: Object.values(usersMap) };
    }

    case SET_TOTAL:
      return { ...state, total: action.payload };
    case SET_PAGE:
      return { ...state, page: action.payload };
    case SET_LOADING:
      return { ...state, loading: action.payload };

    case TOGGLE_FOLLOW: {
      const id = action.payload;
      const follows = { ...state.follows, [id]: !state.follows[id] };
      localStorage.setItem('mini-social', JSON.stringify({ ...persisted, follows }));
      const users = state.users.map(u => u.id === id ? { ...u, isFollowed: follows[id] } : u);
      return { ...state, users, follows };
    }

    case TOGGLE_HIDDEN: {
      const id = action.payload;
      const hidden = { ...state.hidden, [id]: !state.hidden[id] };
      localStorage.setItem('mini-social', JSON.stringify({ ...persisted, hidden }));
      const users = state.users.map(u => u.id === id ? { ...u, isHidden: hidden[id] } : u);
      return { ...state, users, hidden };
    }

    case SET_TOAST:
      return { ...state, toast: action.payload };

    default:
      return state;
  }
}