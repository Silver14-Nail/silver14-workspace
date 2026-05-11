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
  adminMessages,
  supportedAdminLocales,
  type AdminLocale,
} from './messages';

type AdminI18nContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: string) => string;
};

const STORAGE_KEY = 'silver14-admin-locale';

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('en');

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);

    if (isAdminLocale(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const value = useMemo<AdminI18nContextValue>(() => {
    const setLocale = (nextLocale: AdminLocale) => {
      setLocaleState(nextLocale);
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
    };

    const t = (key: string) => adminMessages[locale][key] ?? adminMessages.en[key] ?? key;

    return { locale, setLocale, t };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminTranslation() {
  const context = useContext(AdminI18nContext);

  if (!context) {
    throw new Error('useAdminTranslation must be used within AdminI18nProvider');
  }

  return context;
}

export function isAdminLocale(value: string | null): value is AdminLocale {
  return supportedAdminLocales.includes(value as AdminLocale);
}
