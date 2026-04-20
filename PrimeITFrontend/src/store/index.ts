import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

// Persist auth state to localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem('primeit_auth');
    return serialized ? { auth: JSON.parse(serialized) } : undefined;
  } catch { return undefined; }
};

const saveState = (state: RootState) => {
  try {
    localStorage.setItem('primeit_auth', JSON.stringify(state.auth));
  } catch { /* ignore */ }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => saveState(store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

