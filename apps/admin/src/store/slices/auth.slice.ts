import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { authService } from '@/services/auth.service';
import { TokenStorage } from '@/lib/token.storage';
import type { AuthStatus, AuthUser } from '@/types/auth.types';
import type { RootState } from '../index';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  isInitialized: false,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const initializeAppThunk = createAsyncThunk<
  AuthUser,
  void,
  { state: RootState; rejectValue: string }
>(
  'auth/initialize',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();

    if (auth.user) return auth.user;

    if (!TokenStorage.getAccessToken()) {
      return rejectWithValue('No token');
    }

    try {
      return await authService.getMe();
    } catch {
      return rejectWithValue('Unauthorized');
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return !auth.isInitialized && auth.status !== 'loading';
    },
  },
);

export const loginThunk = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await authService.login(email, password);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isInitialized = true;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── initializeApp ──────────────────────────────────────────────────────
    builder
      .addCase(initializeAppThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initializeAppThunk.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.status = 'succeeded';
        state.isInitialized = true;
      })
      .addCase(initializeAppThunk.rejected, (state) => {
        state.user = null;
        state.status = 'failed';
        state.isInitialized = true;
        state.error = null;
      });

    // ── login ──────────────────────────────────────────────────────────────
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.status = 'succeeded';
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload ?? 'Login failed';
      });

    // ── logout ─────────────────────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.isInitialized = false;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;
export const selectIsAuthLoading = (state: RootState) => state.auth.status === 'loading';
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;

export default authSlice.reducer;
