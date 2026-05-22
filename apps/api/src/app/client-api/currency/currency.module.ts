import { Module } from '@nestjs/common';
import { CurrencySharedModule } from '@/shared/currency/currency.module';
import { ClientCurrencyController } from './currency.controller';

@Module({
  imports: [CurrencySharedModule],
  controllers: [ClientCurrencyController],
})
export class ClientCurrencyModule {}
