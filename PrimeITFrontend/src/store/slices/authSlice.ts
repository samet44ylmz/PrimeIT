import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  role: string | null;
  fullName: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  token: null,
  role: null,
  fullName: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userId: string; token: string; role: string; fullName: string }>) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.fullName = action.payload.fullName;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.token = null;
      state.role = null;
      state.fullName = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
