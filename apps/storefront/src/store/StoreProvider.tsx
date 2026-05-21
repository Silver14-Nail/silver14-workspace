'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { store } from './index';
import { initializeAuth } from './slices/auth.slice';
import { logger } from '../lib/logger';

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
      queryCache: new QueryCache({
        onError: (error, query) => {
          logger.error(
            `Query failed: ${String(query.queryKey)}`,
            error,
            'QueryCache',
          );
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          logger.error('Mutation failed', error, 'MutationCache');
        },
      }),
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
