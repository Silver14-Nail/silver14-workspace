import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IncomingHttpHeaders } from 'http';
import type { PaypalConfig } from '@/config/paypal.config';

interface PaypalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PaypalOrderUnit {
  reference_id: string;
  amount: { currency_code: string; value: string };
}

interface PaypalCaptureResult {
  id: string;
  status: string;
  payer?: { email_address?: string; payer_id?: string };
  purchase_units: Array<{
    reference_id?: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
}

interface PaypalOrderResult {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id?: string;
    amount: { currency_code: string; value: string };
  }>;
}

interface PaypalWebhookVerifyResult {
  verification_status: 'SUCCESS' | 'FAILURE';
}

@Injectable()
export class PaypalService {
  private readonly config: PaypalConfig;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<PaypalConfig>('paypal');
  }

  private get baseUrl(): string {
    return this.config.mode === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
      'base64',
    );

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to get PayPal access token');
    }

    const data = (await res.json()) as PaypalAccessTokenResponse;
    return data.access_token;
  }

  async createOrder(amount: number, currency: string, referenceId: string) {
    const token = await this.getAccessToken();

    const unit: PaypalOrderUnit = {
      reference_id: referenceId,
      amount: {
        currency_code: currency.toUpperCase(),
        value: amount.toFixed(2),
      },
    };

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [unit] }),
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to create PayPal order');
    }

    return res.json() as Promise<{ id: string; status: string }>;
  }

  async captureOrder(paypalOrderId: string): Promise<PaypalCaptureResult> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let detail = '';
      try {
        const err = await res.json() as { message?: string; details?: { issue?: string }[] };
        detail = err.message ?? err.details?.[0]?.issue ?? '';
      } catch { /* ignore parse error */ }
      throw new InternalServerErrorException(
        `PayPal capture failed (HTTP ${res.status})${detail ? `: ${detail}` : ''}`,
      );
    }

    return res.json() as Promise<PaypalCaptureResult>;
  }

  async getOrder(paypalOrderId: string): Promise<PaypalOrderResult | null> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return res.json() as Promise<PaypalOrderResult>;
  }

  async verifyWebhookSignature(headers: IncomingHttpHeaders, rawBody: string): Promise<boolean> {
    const token = await this.getAccessToken();
    const h = (key: string) => {
      const val = headers[key];
      return Array.isArray(val) ? val[0] : (val ?? '');
    };

    let webhookEvent: unknown;
    try {
      webhookEvent = JSON.parse(rawBody);
    } catch {
      return false;
    }

    const payload = {
      transmission_id: h('paypal-transmission-id'),
      transmission_time: h('paypal-transmission-time'),
      cert_url: h('paypal-cert-url'),
      auth_algo: h('paypal-auth-algo'),
      transmission_sig: h('paypal-transmission-sig'),
      webhook_id: this.config.webhookId,
      webhook_event: webhookEvent,
    };

    const res = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as PaypalWebhookVerifyResult;
    return data.verification_status === 'SUCCESS';
  }
}
