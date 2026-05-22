import { Injectable, Logger } from '@nestjs/common';
import type { ITranslationProvider, TranslationInput, TranslationOutput } from '../translation.provider.interface';

/**
 * No-op provider used when no AI translation API key is configured.
 * Stores the original source text as the translation so content is never empty.
 */
@Injectable()
export class NoopTranslationProvider implements ITranslationProvider {
  private readonly logger = new Logger(NoopTranslationProvider.name);

  translate(input: TranslationInput): Promise<TranslationOutput> {
    this.logger.warn(
      `No translation provider configured — using source text for ${input.targetLang}`,
    );
    return Promise.resolve({ translatedText: input.text });
  }

  isAvailable(): boolean {
    return true;
  }
}
