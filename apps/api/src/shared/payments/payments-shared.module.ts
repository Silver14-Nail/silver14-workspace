import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ─── Low-level API clients ──────────────────────────────────────────────────
import { StripeService } from './stripe.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PaypalService } from './paypal.service';

// ─── Airwallex provider ─────────────────────────────────────────────────────
import { AirwallexService } from './airwallex/airwallex.service';
import { AirwallexFulfillmentService } from './airwallex/airwallex-fulfillment.service';
import { AirwallexRefundService } from './airwallex/airwallex-refund.service';
import { AirwallexController } from './airwallex/airwallex.controller';
import { AirwallexWebhookController } from './airwallex/airwallex-webhook.controller';
import { AirwallexDetailEntity } from '@/db/entities/payments/airwallex-detail.entity';
import { PaymentEntity } from '@/db/entities/payments/payment.entity';

/**
 * Shared payment module — aggregates all payment providers and their services.
 *
 * Legacy providers (Stripe, Lemon Squeezy, PayPal) — pure API clients.
 * New providers (Airwallex) — full module with controllers, DTOs, entities.
 *
 * All services are exported so the `client-api` and `admin-api` domains
 * can import a single {@link PaymentsSharedModule}.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AirwallexDetailEntity, PaymentEntity])],
  providers: [
    // Legacy API clients
    StripeService,
    LemonSqueezyService,
    PaypalService,
    // Airwallex
    AirwallexService,
    AirwallexFulfillmentService,
    AirwallexRefundService,
  ],
  controllers: [AirwallexController, AirwallexWebhookController],
  exports: [
    // Legacy
    StripeService,
    LemonSqueezyService,
    PaypalService,
    // Airwallex
    AirwallexService,
    AirwallexFulfillmentService,
    AirwallexRefundService,
  ],
})
export class PaymentsSharedModule {}
