import { Module } from '@nestjs/common';

import { PaymentsSharedModule } from '@/shared/payments/payments-shared.module';
import { ClientPaymentsModule } from '../payments/payments.module';

import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PaymentsSharedModule, ClientPaymentsModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
