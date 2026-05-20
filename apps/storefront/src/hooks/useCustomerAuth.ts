'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  authActions,
  forgotPasswordThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  resetPasswordThunk,
} from '@/store/slices/auth.slice';

export type { CustomerUser, CustomerAuthTokens } from '@/store/slices/auth.slice';

export function useCustomerAuth() {
  const dispatch = useAppDispatch();
  const { status, user, tokens } = useAppSelector((s) => s.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      await dispatch(loginThunk({ email, password })).unwrap();
    },
    [dispatch],
  );

  const register = useCallback(
    async (input: { email: string; name: string; password: string }) => {
      await dispatch(registerThunk(input)).unwrap();
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    // Clear local state immediately for instant UI feedback,
    // then ask the API to clear the httpOnly refresh-token cookie.
    dispatch(authActions.logout());
    await dispatch(logoutThunk()).unwrap().catch(() => undefined);
  }, [dispatch]);

  const forgotPassword = useCallback(
    async (email: string) => dispatch(forgotPasswordThunk(email)).unwrap(),
    [dispatch],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) =>
      dispatch(resetPasswordThunk({ token, newPassword })).unwrap(),
    [dispatch],
  );

  return { forgotPassword, login, logout, register, resetPassword, status, tokens, user };
}
