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
import { CART_QUERY_KEY } from '../features/cart/cart.hooks';
import { setGuestCartId } from '../features/cart/cart.storage';
import type { ApiAddItemResponse } from '../features/cart/cart.types';

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
    // Use a local variable so the MutationCache.onSuccess closure can reference
    // the QueryClient before the ref is populated (safe: the callback only runs
    // after the first mutation settles, well after this initializer returns).
    const qc = new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          logger.error(`Query failed: ${String(query.queryKey)}`, error, 'QueryCache');
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          logger.error('Mutation failed', error, 'MutationCache');
        },
        // Global success handler — fires even when the originating component has
        // unmounted (e.g. user navigated away before the API responded). This is
        // the fix for Safari: useMutation.onSuccess is observer-bound and silently
        // dropped after unmount, but MutationCache.onSuccess always fires.
        onSuccess: (data, _vars, _ctx, mutation) => {
          const mutKey = mutation.options.mutationKey;
          if (
            Array.isArray(mutKey) &&
            mutKey[0] === 'cart' &&
            mutKey[1] === 'addItem'
          ) {
            const response = data as ApiAddItemResponse;
            if (response?.cartId && response?.cart) {
              // Only update guest-cart keys — authenticated users are handled by
              // the component-level onSuccess which has the correct user queryKey.
              const { tokens } = store.getState().auth;
              if (!tokens?.accessToken) {
                setGuestCartId(response.cartId);
                // Write server data to BOTH queryKey variants so the cart page
                // sees correct data regardless of whether guestCartId was already
                // in localStorage when it mounted.
                qc.setQueryData([...CART_QUERY_KEY, 'guest', 'none'], response.cart);
                qc.setQueryData([...CART_QUERY_KEY, 'guest', response.cartId], response.cart);
              }
            }
          }
        },
      }),
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
    queryClientRef.current = qc;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClientRef.current}>
        <AuthInitializer />
        <ExchangeRateInitializer initialCode={initialCurrencyCode} />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
