import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  forgotCustomerPassword,
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  refreshCustomerToken,
  registerCustomer,
  resetCustomerPassword,
} from '@/features/auth/customer-auth.api';
import {
  clearStoredCustomerTokens,
  getStoredCustomerTokens,
  isAccessTokenExpired,
  setStoredCustomerTokens,
} from '@/features/auth/customer-auth.storage';
import type { CustomerAuthTokens, CustomerUser } from '@/features/auth/customer-auth.types';

export type { CustomerUser, CustomerAuthTokens };

type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  user: CustomerUser | null;
  tokens: CustomerAuthTokens | null;
}

const initialState: AuthState = {
  status: 'checking',
  user: null,
  tokens: null,
};

// Restores session from localStorage; falls back to the httpOnly refresh-token cookie
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  if (typeof window === 'undefined') return null;

  const stored = getStoredCustomerTokens();

  if (stored && !isAccessTokenExpired(stored)) {
    try {
      const user = await getCurrentCustomer(stored.accessToken);
      return { tokens: stored, user };
    } catch {
      // Server rejected the token — fall through to cookie refresh
    }
  }

  try {
    const response = await refreshCustomerToken();
    setStoredCustomerTokens(response.tokens);
    const user = await getCurrentCustomer(response.tokens.accessToken);
    return { tokens: response.tokens, user };
  } catch {
    clearStoredCustomerTokens();
    return null;
  }
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await loginCustomer(email, password);
    setStoredCustomerTokens(response.tokens);
    return response;
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (input: { email: string; name: string; password: string }) => {
    const response = await registerCustomer(input);
    setStoredCustomerTokens(response.tokens);
    return response;
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutCustomer();
  } catch {
    // Always clear local state even if the API call fails
  }
  clearStoredCustomerTokens();
});

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string) => forgotCustomerPassword(email),
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }: { token: string; newPassword: string }) =>
    resetCustomerPassword(token, newPassword),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Sync action for immediate 401 handling without waiting for the thunk
    logout(state) {
      clearStoredCustomerTokens();
      state.status = 'guest';
      state.user = null;
      state.tokens = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = 'authenticated';
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
        } else {
          state.status = 'guest';
          state.user = null;
          state.tokens = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        clearStoredCustomerTokens();
        state.status = 'guest';
        state.user = null;
        state.tokens = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'guest';
        state.user = null;
        state.tokens = null;
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
