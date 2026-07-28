import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ─── Low-level API clients ──────────────────────────────────────────────────
import { StripeService } from './stripe.service';
import { PaypalService } from './paypal.service';

// ─── OnePAY provider ────────────────────────────────────────────────────────
import { OnepayService } from './onepay/onepay.service';
import { OnepayFulfillmentService } from './onepay/onepay-fulfillment.service';
import { OnepayController } from './onepay/onepay.controller';
import { OnepayIpnController } from './onepay/onepay-ipn.controller';
import { OnepayDetailEntity } from '@/db/entities/payments/onepay-detail.entity';

import { PaymentEntity } from '@/db/entities/payments/payment.entity';

/**
 * Shared payment module — aggregates all payment providers and their services.
 *
 * Legacy providers (Stripe, PayPal) — pure API clients.
 * OnePAY — full module with controllers, entities.
 *
 * All services are exported so the `client-api` and `admin-api` domains
 * can import a single {@link PaymentsSharedModule}.
 */
@Module({
  imports: [TypeOrmModule.forFeature([OnepayDetailEntity, PaymentEntity])],
  providers: [
    // Legacy API clients
    StripeService,
    PaypalService,
    // OnePAY
    OnepayService,
    OnepayFulfillmentService,
  ],
  controllers: [OnepayController, OnepayIpnController],
  exports: [
    // Legacy
    StripeService,
    PaypalService,
    // OnePAY
    OnepayService,
    OnepayFulfillmentService,
  ],
})
export class PaymentsSharedModule {}
