import { Module } from '@nestjs/common';

import { StripeService } from './stripe.service';
import { PaypalService } from './paypal.service';

@Module({
  providers: [StripeService, PaypalService],
  exports: [StripeService, PaypalService],
})
export class PaymentsSharedModule {}
