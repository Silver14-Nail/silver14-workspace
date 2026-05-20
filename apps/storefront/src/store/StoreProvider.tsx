'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './index';
import { initializeAuth } from './slices/auth.slice';

function AuthInitializer() {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Stable QueryClient instance per app mount — not re-created on every render
  const queryClientRef = useRef<QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClientRef.current}>
        <AuthInitializer />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
