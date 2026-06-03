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

// ─── 2Checkout provider ──────────────────────────────────────────────────────
import { TwocheckoutService } from './twocheckout/twocheckout.service';
import { TwocheckoutFulfillmentService } from './twocheckout/twocheckout-fulfillment.service';
import { TwocheckoutController } from './twocheckout/twocheckout.controller';
import { TwocheckoutWebhookController } from './twocheckout/twocheckout-webhook.controller';
import { TwocheckoutDetailEntity } from '@/db/entities/payments/twocheckout-detail.entity';

// ─── Ngân Lượng provider ────────────────────────────────────────────────────
import { NgLuongService } from './nganluong/nganluong.service';
import { NgLuongFulfillmentService } from './nganluong/nganluong-fulfillment.service';
import { NgLuongController } from './nganluong/nganluong.controller';
import { NgLuongWebhookController } from './nganluong/nganluong-webhook.controller';
import { NgLuongDetailEntity } from '@/db/entities/payments/nganluong-detail.entity';

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
 * Legacy providers (Stripe, Lemon Squeezy, PayPal) — pure API clients.
 * New providers (Airwallex, 2Checkout) — full module with controllers, entities.
 *
 * All services are exported so the `client-api` and `admin-api` domains
 * can import a single {@link PaymentsSharedModule}.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AirwallexDetailEntity,
      TwocheckoutDetailEntity,
      NgLuongDetailEntity,
      OnepayDetailEntity,
      PaymentEntity,
    ]),
  ],
  providers: [
    // Legacy API clients
    StripeService,
    LemonSqueezyService,
    PaypalService,
    // Airwallex
    AirwallexService,
    AirwallexFulfillmentService,
    AirwallexRefundService,
    // 2Checkout
    TwocheckoutService,
    TwocheckoutFulfillmentService,
    // Ngân Lượng
    NgLuongService,
    NgLuongFulfillmentService,
    // OnePAY
    OnepayService,
    OnepayFulfillmentService,
  ],
  controllers: [
    AirwallexController,
    AirwallexWebhookController,
    TwocheckoutController,
    TwocheckoutWebhookController,
    NgLuongController,
    NgLuongWebhookController,
    OnepayController,
    OnepayIpnController,
  ],
  exports: [
    // Legacy
    StripeService,
    LemonSqueezyService,
    PaypalService,
    // Airwallex
    AirwallexService,
    AirwallexFulfillmentService,
    AirwallexRefundService,
    // 2Checkout
    TwocheckoutService,
    TwocheckoutFulfillmentService,
    // Ngân Lượng
    NgLuongService,
    NgLuongFulfillmentService,
    // OnePAY
    OnepayService,
    OnepayFulfillmentService,
  ],
})
export class PaymentsSharedModule {}
