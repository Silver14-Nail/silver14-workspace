import type { I18nConfig } from 'next-i18next';

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'vi'],
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: [
    'translation',
    'account',
    'cart',
    'checkout',
    'product',
    'nav',
    'tracking',
    'trust',
    'wholesale',
  ],
  resourceLoader: (language: string, namespace: string) =>
    import(`./i18n/locales/${language}/${namespace}.json`),
};

export default i18nConfig;
