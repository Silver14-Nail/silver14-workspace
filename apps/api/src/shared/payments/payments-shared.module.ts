import { Module } from '@nestjs/common';

import { StripeService } from './stripe.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PaypalService } from './paypal.service';

@Module({
  providers: [StripeService, LemonSqueezyService, PaypalService],
  exports: [StripeService, LemonSqueezyService, PaypalService],
})
export class PaymentsSharedModule {}
