'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentAdmin,
  loginAdmin,
  verifyAdminTwoFactor,
} from './admin-auth.api';
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from './admin-auth.storage';
import type {
  AdminAuthTokens,
  AdminLoginResponse,
  AdminUser,
} from './admin-auth.types';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AdminAuthContextValue = {
  login: (email: string, password: string) => Promise<AdminLoginResponse>;
  logout: () => void;
  status: AuthStatus;
  tokens: AdminAuthTokens | null;
  user: AdminUser | null;
  verifyTwoFactor: (challengeId: string, code: string) => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [tokens, setTokens] = useState<AdminAuthTokens | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedTokens = getStoredTokens();

    if (!storedTokens) {
      setStatus('unauthenticated');
      return;
    }

    getCurrentAdmin(storedTokens.accessToken)
      .then((currentUser) => {
        setTokens(storedTokens);
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        clearStoredTokens();
        setTokens(null);
        setUser(null);
        setStatus('unauthenticated');
      });
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      login: async (email: string, password: string) => {
        const response = await loginAdmin(email, password);

        if ('twoFactorRequired' in response) {
          return response;
        }

        applyAuthenticatedSession(response);

        return response;
      },
      logout: () => {
        clearStoredTokens();
        setTokens(null);
        setUser(null);
        setStatus('unauthenticated');
      },
      status,
      tokens,
      user,
      verifyTwoFactor: async (challengeId: string, code: string) => {
        const response = await verifyAdminTwoFactor(challengeId, code);

        applyAuthenticatedSession(response);
      },
    }),
    [status, tokens, user],
  );

  function applyAuthenticatedSession(response: {
    tokens: AdminAuthTokens;
    user: AdminUser;
  }) {
    setStoredTokens(response.tokens);
    setTokens(response.tokens);
    setUser(response.user);
    setStatus('authenticated');
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}
