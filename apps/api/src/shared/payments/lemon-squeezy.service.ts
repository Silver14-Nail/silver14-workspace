import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { LemonSqueezyConfig } from '@/config/lemon-squeezy.config';

interface LsCheckoutResponse {
  data: {
    id: string;
    attributes: { url: string };
  };
}

@Injectable()
export class LemonSqueezyService {
  private readonly apiKey: string;
  private readonly storeId: string;
  private readonly variantId: string;
  private readonly webhookSecret: string;
  private readonly baseUrl = 'https://api.lemonsqueezy.com/v1';

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<LemonSqueezyConfig>('lemonSqueezy');
    this.apiKey = config.apiKey;
    this.storeId = config.storeId;
    this.variantId = config.variantId;
    this.webhookSecret = config.webhookSecret;
  }

  private get reqHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };
  }

  // Currencies where 1 unit = smallest unit (no cents/subunit)
  private static readonly ZERO_DECIMAL = new Set([
    'BIF','CLP','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF',
  ]);

  private toSmallestUnit(amount: number, currency: string): number {
    return LemonSqueezyService.ZERO_DECIMAL.has(currency.toUpperCase())
      ? Math.round(amount)
      : Math.round(amount * 100);
  }

  async createCheckout(
    amount: number,
    currency: string,
    checkoutSessionId: string,
    redirectUrl: string,
    prefill?: {
      email?: string;
      name?: string;
      country?: string;   // ISO 3166-1 alpha-2, e.g. "VN", "US"
      zip?: string;
    },
  ): Promise<{ checkoutUrl: string; lsCheckoutId: string }> {
    const billingAddress =
      prefill?.country
        ? { country: prefill.country, ...(prefill.zip ? { zip: prefill.zip } : {}) }
        : undefined;

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: this.toSmallestUnit(amount, currency),
          checkout_data: {
            ...(prefill?.email ? { email: prefill.email } : {}),
            ...(prefill?.name ? { name: prefill.name } : {}),
            ...(billingAddress ? { billing_address: billingAddress } : {}),
            custom: { checkoutSessionId },
          },
          product_options: {
            redirect_url: redirectUrl,
          },
          checkout_options: {
            media: false,
            logo: true,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: this.storeId } },
          variant: { data: { type: 'variants', id: this.variantId } },
        },
      },
    };

    const res = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: this.reqHeaders,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Lemon Squeezy API error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as LsCheckoutResponse;
    return {
      checkoutUrl: json.data.attributes.url,
      lsCheckoutId: json.data.id,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const hash = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  }
}
