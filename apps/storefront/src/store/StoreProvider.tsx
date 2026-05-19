'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { initializeAuth } from './slices/auth.slice';

function AuthInitializer() {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  );
}
