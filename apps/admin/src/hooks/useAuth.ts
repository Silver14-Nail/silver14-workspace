import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearError,
  initializeAppThunk,
  loginThunk,
  logoutThunk,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsAuthLoading,
  selectIsInitialized,
  selectUser,
} from '@/store/slices/auth.slice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const isInitialized = useAppSelector(selectIsInitialized);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        return { ok: true as const };
      }
      return { ok: false as const, error: (result.payload as string) ?? 'Login failed' };
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    router.replace('/login');
  }, [dispatch, router]);

  const initialize = useCallback(() => dispatch(initializeAppThunk()), [dispatch]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    initialize,
    dismissError,
  };
}
