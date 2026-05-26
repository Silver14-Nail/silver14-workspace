import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { I18nTranslationEntity } from '@/db/entities/shared/i18n-translation.entity';

import { LanguageDetectionService } from './language-detection.service';
import { TranslationService } from './translation.service';
import { OpenAiTranslationProvider } from './providers/openai-translation.provider';
import { MyMemoryTranslationProvider } from './providers/mymemory-translation.provider';
import { NoopTranslationProvider } from './providers/noop-translation.provider';
import { TRANSLATION_PROVIDER_TOKEN } from './translation.constants';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([I18nTranslationEntity]),
  ],
  providers: [
    LanguageDetectionService,
    OpenAiTranslationProvider,
    MyMemoryTranslationProvider,
    NoopTranslationProvider,
    {
      provide: TRANSLATION_PROVIDER_TOKEN,
      useFactory: (
        config: ConfigService,
        openai: OpenAiTranslationProvider,
        myMemory: MyMemoryTranslationProvider,
      ) => (config.get('OPENAI_API_KEY') ? openai : myMemory),
      inject: [ConfigService, OpenAiTranslationProvider, MyMemoryTranslationProvider],
    },
    TranslationService,
  ],
  exports: [TranslationService, LanguageDetectionService],
})
export class TranslationModule {}
