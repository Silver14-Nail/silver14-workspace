import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaypalDetailEntity } from '@/db/entities/payments/paypal-detail.entity';
import { CardDetailEntity } from '@/db/entities/payments/card-detail.entity';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, PaypalDetailEntity, CardDetailEntity])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
