export const SUPPORTED_LOCALES = ['en', 'vi'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: SupportedLocale = 'en';

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  vi: 'Vietnamese',
};

export const TRANSLATION_PROVIDER_TOKEN = 'TRANSLATION_PROVIDER';
