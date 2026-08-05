'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { store } from './index';
import { currencyActions } from './slices/currency.slice';
import { initializeAuth } from './slices/auth.slice';
import { fetchExchangeRates } from '@/services/currency.service';
import { logger } from '../lib/logger';
import type { CurrencyCode } from '@/config/commerce.config';

function AuthInitializer() {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return null;
}

function ExchangeRateInitializer({ initialCode }: { initialCode?: CurrencyCode }) {
  useEffect(() => {
    // Always initialize from SSR cookie — never rely on potentially stale localStorage shape
    store.dispatch(currencyActions.setCurrency(initialCode ?? 'USD'));

    fetchExchangeRates()
      .then((rates) => store.dispatch(currencyActions.setExchangeRates(rates)))
      .catch((err) => logger.error('Failed to load exchange rates', err, 'ExchangeRateInitializer'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function StoreProvider({
  children,
  initialCurrencyCode,
}: {
  children: React.ReactNode;
  initialCurrencyCode?: CurrencyCode;
}) {
  const queryClientRef = useRef<QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          logger.error(`Query failed: ${String(query.queryKey)}`, error, 'QueryCache');
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
        <ExchangeRateInitializer initialCode={initialCurrencyCode} />
        <RegionInitializer isAsiaRegion={isAsiaRegion} />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
