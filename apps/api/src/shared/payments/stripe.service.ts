import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  createPaymentIntent(amount: number, currency: string, metadata: Stripe.MetadataParam) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
