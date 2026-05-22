import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ITranslationProvider, TranslationInput, TranslationOutput } from '../translation.provider.interface';
import { LOCALE_NAMES } from '../translation.constants';

/**
 * OpenAI-powered translation provider.
 * Requires OPENAI_API_KEY environment variable.
 * Uses gpt-4o-mini by default for cost efficiency.
 */
@Injectable()
export class OpenAiTranslationProvider implements ITranslationProvider {
  private readonly logger = new Logger(OpenAiTranslationProvider.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.model = this.config.get<string>('OPENAI_TRANSLATION_MODEL') ?? 'gpt-4o-mini';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async translate(input: TranslationInput): Promise<TranslationOutput> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const sourceName = LOCALE_NAMES[input.sourceLang];
    const targetName = LOCALE_NAMES[input.targetLang];
    const contextHint = input.context ? `Context: ${input.context}. ` : '';

    const systemPrompt =
      `You are a professional e-commerce translator specializing in beauty and nail art products. ` +
      `${contextHint}Translate the following ${sourceName} text to ${targetName}. ` +
      `Preserve formatting, brand tone, and product terminology. ` +
      `Return ONLY the translated text with no explanation or extra text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.text },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const translatedText = data.choices[0]?.message?.content?.trim() ?? input.text;
    return { translatedText };
  }
}
