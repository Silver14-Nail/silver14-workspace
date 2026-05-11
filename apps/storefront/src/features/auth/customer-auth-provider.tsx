'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentCustomer, loginCustomer, registerCustomer } from './customer-auth.api';
import {
  clearStoredCustomerTokens,
  getStoredCustomerTokens,
  setStoredCustomerTokens,
} from './customer-auth.storage';
import type { CustomerAuthTokens, CustomerUser } from './customer-auth.types';

type CustomerAuthStatus = 'checking' | 'authenticated' | 'guest';

type CustomerAuthContextValue = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (input: { email: string; name: string; password: string }) => Promise<void>;
  status: CustomerAuthStatus;
  tokens: CustomerAuthTokens | null;
  user: CustomerUser | null;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CustomerAuthStatus>('checking');
  const [tokens, setTokens] = useState<CustomerAuthTokens | null>(null);
  const [user, setUser] = useState<CustomerUser | null>(null);

  useEffect(() => {
    const storedTokens = getStoredCustomerTokens();

    if (!storedTokens) {
      setStatus('guest');
      return;
    }

    getCurrentCustomer(storedTokens.accessToken)
      .then((currentUser) => {
        setTokens(storedTokens);
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        clearSession();
      });
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      login: async (email: string, password: string) => {
        const response = await loginCustomer(email, password);

        setStoredCustomerTokens(response.tokens);
        setTokens(response.tokens);
        setUser(response.user);
        setStatus('authenticated');
      },
      logout: clearSession,
      register: async (input) => {
        const response = await registerCustomer(input);

        setStoredCustomerTokens(response.tokens);
        setTokens(response.tokens);
        setUser(response.user);
        setStatus('authenticated');
      },
      status,
      tokens,
      user,
    }),
    [status, tokens, user],
  );

  function clearSession() {
    clearStoredCustomerTokens();
    setTokens(null);
    setUser(null);
    setStatus('guest');
  }

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }

  return context;
}
