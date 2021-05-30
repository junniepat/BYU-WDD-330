import SecureLS from 'secure-ls';
var ls = new SecureLS({ encodingType: 'aes' });

export const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      ls.set('user', JSON.stringify(action.payload.user));
      ls.set('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      sessionStorage.clear();
      localStorage.clear();
      ls.removeAll();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};
