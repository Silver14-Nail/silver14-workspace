import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProductTranslationEntity } from '@/db/entities/products/product-translation.entity';
import { CollectionTranslationEntity } from '@/db/entities/products/collection-translation.entity';

import { LanguageDetectionService } from './language-detection.service';
import { TranslationService } from './translation.service';
import { OpenAiTranslationProvider } from './providers/openai-translation.provider';
import { NoopTranslationProvider } from './providers/noop-translation.provider';
import { TRANSLATION_PROVIDER_TOKEN } from './translation.constants';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ProductTranslationEntity, CollectionTranslationEntity]),
  ],
  providers: [
    LanguageDetectionService,
    OpenAiTranslationProvider,
    NoopTranslationProvider,
    {
      provide: TRANSLATION_PROVIDER_TOKEN,
      useFactory: (
        config: ConfigService,
        openai: OpenAiTranslationProvider,
        noop: NoopTranslationProvider,
      ) => (config.get('OPENAI_API_KEY') ? openai : noop),
      inject: [ConfigService, OpenAiTranslationProvider, NoopTranslationProvider],
    },
    TranslationService,
  ],
  exports: [TranslationService, LanguageDetectionService],
})
export class TranslationModule {}
