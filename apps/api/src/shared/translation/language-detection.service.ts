import { Injectable } from '@nestjs/common';
import type { SupportedLocale } from './translation.constants';
import { SUPPORTED_LOCALES, FALLBACK_LOCALE } from './translation.constants';

/**
 * Lightweight language detector using character-set analysis.
 * Covers all 4 supported locales without external dependencies.
 * Vietnamese tonal marks are highly distinctive; German/French have unique diacritics.
 */
@Injectable()
export class LanguageDetectionService {
  // Vietnamese tonal diacritics + đ/Đ — very distinct from other Latin scripts
  private readonly VI_PATTERN =
    /[àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿĐđƯưƠơẮắẰằẲẳẴẵẶặẤấẦầẨẩẪẫẬậẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ]/;

  // German-specific: ä ö ü Ä Ö Ü ß
  private readonly DE_PATTERN = /[äöüÄÖÜß]/;

  // French-specific: ç œ Œ æ Æ (â/ê/î/ô/û overlap with others so we weight by density)
  private readonly FR_PATTERN = /[çÇœŒæÆ]/;

  private readonly FR_ACCENT_PATTERN = /[àâéèêëîïôùûüÿÀÂÉÈÊËÎÏÔÙÛÜŸ]/g;
  private readonly DE_ACCENT_PATTERN = /[äöüÄÖÜß]/g;

  detect(text: string): SupportedLocale {
    if (!text?.trim()) return FALLBACK_LOCALE;

    // Vietnamese detection is highly reliable due to unique tonal chars
    if (this.VI_PATTERN.test(text)) return 'vi';

    // German: ß or ä/ö/ü with high density
    const deMatches = (text.match(this.DE_ACCENT_PATTERN) ?? []).length;
    const frMatches = (text.match(this.FR_ACCENT_PATTERN) ?? []).length;

    if (this.DE_PATTERN.test(text) && deMatches >= frMatches) return 'de';

    // French: ç/œ strong indicators, or high French accent density
    if (this.FR_PATTERN.test(text) || frMatches > deMatches) return 'fr';

    return 'en';
  }

  isSupported(locale: string): locale is SupportedLocale {
    return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
  }
}
