import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { StripeConfig } from '@/config/stripe.config';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe.Stripe;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<StripeConfig>('stripe');
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
    this.webhookSecret = config.webhookSecret;
  }

  createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): ReturnType<Stripe.Stripe['paymentIntents']['create']> {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  retrievePaymentIntent(
    paymentIntentId: string,
  ): ReturnType<Stripe.Stripe['paymentIntents']['retrieve']> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
  }

  constructWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): ReturnType<Stripe.Stripe['webhooks']['constructEvent']> {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }
}
