import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
} from '@/features/auth/customer-auth.api';
import {
  clearStoredCustomerTokens,
  getStoredCustomerTokens,
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

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  if (typeof window === 'undefined') return null;
  const storedTokens = getStoredCustomerTokens();
  if (!storedTokens) return null;
  const user = await getCurrentCustomer(storedTokens.accessToken);
  return { tokens: storedTokens, user };
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        clearStoredCustomerTokens();
        state.status = 'guest';
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
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
