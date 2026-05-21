import { Injectable, Logger } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';

import { StripeService } from '@/shared/payments/stripe.service';
import { PaypalService } from '@/shared/payments/paypal.service';
import { ClientPaymentsService } from '../payments/payments.service';

// Minimal shape of Stripe objects we extract from webhook events
interface StripePaymentIntent {
  id: string;
  metadata?: Record<string, string> | null;
  last_payment_error?: { message?: string } | null;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
    private readonly clientPaymentsService: ClientPaymentsService,
  ) {}

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: ReturnType<StripeService['constructWebhookEvent']>;

    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.error(`Stripe webhook signature verification failed: ${err}`);
      throw err;
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as unknown as StripePaymentIntent;
        const checkoutSessionId = intent.metadata?.checkoutSessionId;

        if (!checkoutSessionId) {
          this.logger.warn(`payment_intent.succeeded missing checkoutSessionId in metadata`);
          break;
        }

        await this.clientPaymentsService.fulfillStripePayment(intent.id, checkoutSessionId);
        this.logger.log(`Order fulfilled for PaymentIntent ${intent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as unknown as StripePaymentIntent;
        this.logger.warn(
          `PaymentIntent failed: ${intent.id} — ${intent.last_payment_error?.message}`,
        );
        break;
      }

      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  async handlePaypalWebhook(rawBody: string, headers: IncomingHttpHeaders): Promise<void> {
    const isValid = await this.paypalService.verifyWebhookSignature(headers, rawBody);

    if (!isValid) {
      this.logger.error('PayPal webhook signature verification failed');
      throw new Error('Invalid PayPal webhook signature');
    }

    const event = JSON.parse(rawBody) as { event_type: string; resource: Record<string, any> };
    this.logger.log(`PayPal webhook received: ${event.event_type}`);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        this.logger.log(`PayPal PAYMENT.CAPTURE.COMPLETED received — handled by capture endpoint`);
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        this.logger.warn(`PayPal payment declined: ${JSON.stringify(event.resource)}`);
        break;
      }

      default:
        this.logger.log(`Unhandled PayPal event type: ${event.event_type}`);
    }
  }
}
