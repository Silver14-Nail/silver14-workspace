import type { SupportedLocale } from './translation.constants';

export interface TranslationInput {
  text: string;
  sourceLang: SupportedLocale;
  targetLang: SupportedLocale;
  context?: string; // e.g. "product name for a nail art e-commerce brand"
}

export interface TranslationOutput {
  translatedText: string;
}

export interface ITranslationProvider {
  translate(input: TranslationInput): Promise<TranslationOutput>;
  isAvailable(): boolean;
}
