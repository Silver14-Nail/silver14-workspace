'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, loginThunk, registerThunk } from '@/store/slices/auth.slice';

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

  const logout = useCallback(() => {
    dispatch(authActions.logout());
  }, [dispatch]);

  const register = useCallback(
    async (input: { email: string; name: string; password: string }) => {
      await dispatch(registerThunk(input)).unwrap();
    },
    [dispatch],
  );

  return { login, logout, register, status, user, tokens };
}
