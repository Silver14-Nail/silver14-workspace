import type { SupportedLocale } from './translation.constants';
import { SUPPORTED_LOCALES, FALLBACK_LOCALE } from './translation.constants';

/**
 * Resolves the requested locale from HTTP headers.
 * Priority: X-Locale > Accept-Language > fallback (en)
 */
export function resolveLocale(
  xLocale?: string,
  acceptLanguage?: string,
): SupportedLocale {
  // 1. Explicit X-Locale header
  if (xLocale) {
    const normalized = xLocale.trim().toLowerCase().slice(0, 2) as SupportedLocale;
    if ((SUPPORTED_LOCALES as readonly string[]).includes(normalized)) return normalized;
  }

  // 2. Accept-Language header (take first tag, strip region)
  if (acceptLanguage) {
    const primary = acceptLanguage.split(',')[0]?.trim().split(';')[0]?.trim();
    const code = primary?.toLowerCase().slice(0, 2) as SupportedLocale;
    if (code && (SUPPORTED_LOCALES as readonly string[]).includes(code)) return code;
  }

  return FALLBACK_LOCALE;
}
