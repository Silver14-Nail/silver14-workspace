import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AirwallexDetailEntity } from '@/db/entities/payments/airwallex-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';

import { AirwallexService } from './airwallex.service';
import { AirwallexFulfillmentService } from './airwallex-fulfillment.service';
import { AirwallexRefundService } from './airwallex-refund.service';
import { AirwallexController } from './airwallex.controller';
import { AirwallexWebhookController } from './airwallex-webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirwallexDetailEntity, PaymentEntity])],
  providers: [AirwallexService, AirwallexFulfillmentService, AirwallexRefundService],
  controllers: [AirwallexController, AirwallexWebhookController],
  exports: [AirwallexService, AirwallexFulfillmentService, AirwallexRefundService],
})
export class AirwallexModule {}
