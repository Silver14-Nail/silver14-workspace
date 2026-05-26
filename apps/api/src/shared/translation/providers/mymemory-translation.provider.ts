import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ITranslationProvider,
  TranslationInput,
  TranslationOutput,
} from '../translation.provider.interface';

/**
 * Free translation provider via MyMemory public API.
 * No API key required. Rate limit: ~1 000 words/day anonymous,
 * ~5 000 words/day when MYMEMORY_EMAIL env var is set.
 */
@Injectable()
export class MyMemoryTranslationProvider implements ITranslationProvider {
  private readonly logger = new Logger(MyMemoryTranslationProvider.name);
  private readonly email: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.email = this.config.get<string>('MYMEMORY_EMAIL');
  }

  isAvailable(): boolean {
    return true;
  }

  async translate(input: TranslationInput): Promise<TranslationOutput> {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', input.text);
    url.searchParams.set('langpair', `${input.sourceLang}|${input.targetLang}`);
    if (this.email) url.searchParams.set('de', this.email);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`MyMemory API error ${response.status}`);
    }

    const data = (await response.json()) as {
      responseStatus: number;
      responseData: { translatedText: string };
    };

    if (data.responseStatus !== 200) {
      throw new Error(`MyMemory translation failed with status ${data.responseStatus}`);
    }

    const translatedText = data.responseData.translatedText;
    this.logger.debug(
      `[MyMemory] ${input.sourceLang}→${input.targetLang}: "${input.text}" → "${translatedText}"`,
    );

    return { translatedText };
  }
}
