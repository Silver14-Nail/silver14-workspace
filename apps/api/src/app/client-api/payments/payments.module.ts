import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { OrderItemEntity } from '@/db/entities/orders/order-item.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';
import { PaypalDetailEntity } from '@/db/entities/payments/paypal-detail.entity';
import { CardDetailEntity } from '@/db/entities/payments/card-detail.entity';
import { PaymentsSharedModule } from '@/shared/payments/payments-shared.module';

import { ClientPaymentsService } from './payments.service';
import { ClientPaymentsController } from './payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckoutSessionEntity,
      OrderEntity,
      OrderItemEntity,
      PaymentEntity,
      PaypalDetailEntity,
      CardDetailEntity,
    ]),
    PaymentsSharedModule,
  ],
  providers: [ClientPaymentsService],
  controllers: [ClientPaymentsController],
  exports: [ClientPaymentsService],
})
export class ClientPaymentsModule {}
