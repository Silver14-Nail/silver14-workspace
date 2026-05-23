'use client';

import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { useState } from 'react';
import { i18nResources } from './resources';

interface Props {
  children: React.ReactNode;
  initialLocale: string;
}

function createI18nInstance(lng: string) {
  const instance = createInstance();
  instance.use(initReactI18next);
  instance.init({
    lng,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'products', 'orders', 'users', 'collections', 'campaigns', 'coupons', 'supplies', 'checkouts', 'dashboard'],
    resources: i18nResources,
    interpolation: { escapeValue: false },
  });
  return instance;
}

export function AdminI18nProvider({ children, initialLocale }: Props) {
  const [i18n] = useState(() => createI18nInstance(initialLocale));

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
