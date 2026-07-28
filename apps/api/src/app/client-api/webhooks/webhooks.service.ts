import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';

import { StripeService } from '@/shared/payments/stripe.service';
import { PaypalService } from '@/shared/payments/paypal.service';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
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
      throw new BadRequestException('Invalid PayPal webhook signature');
    }

    let event: { event_type: string; resource: AnyRecord };
    try {
      event = JSON.parse(rawBody) as { event_type: string; resource: AnyRecord };
    } catch {
      this.logger.error('PayPal webhook: failed to parse JSON body');
      return; // Acknowledge to PayPal (return 200) — malformed body is not retryable
    }
    this.logger.log(`PayPal webhook received: ${event.event_type}`);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Fallback fulfillment: handles the case where client never called our capture endpoint
        // (e.g. browser crash after PayPal approval). Idempotent — no-op if order already exists.
        const captureResource = event.resource;
        const paypalOrderId = captureResource?.supplementary_data?.related_ids?.order_id as string | undefined;

        if (!paypalOrderId) {
          this.logger.warn('PAYMENT.CAPTURE.COMPLETED: missing order_id in supplementary_data — MANUAL ACTION REQUIRED');
          break;
        }

        try {
          const paypalOrder = await this.paypalService.getOrder(paypalOrderId);
          const checkoutSessionId = paypalOrder?.purchase_units?.[0]?.reference_id;

          if (!checkoutSessionId) {
            this.logger.error(`PAYMENT.CAPTURE.COMPLETED: cannot resolve checkoutSessionId for PayPal order ${paypalOrderId} — MANUAL ACTION REQUIRED`);
            break; // Acknowledge — retrying won't help without reference_id
          }

          await this.clientPaymentsService.fulfillPaypalWebhookCapture(
            paypalOrderId,
            checkoutSessionId,
            captureResource,
          );
          this.logger.log(`PayPal PAYMENT.CAPTURE.COMPLETED fulfilled for session ${checkoutSessionId}`);
        } catch (err) {
          // Log but return 200 so PayPal does not retry non-transient failures (e.g. out-of-stock).
          // Transient DB failures will be re-delivered by PayPal on the next retry cycle.
          this.logger.error(`PAYMENT.CAPTURE.COMPLETED fulfillment error for PayPal order ${paypalOrderId}: ${err}`);
        }
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
