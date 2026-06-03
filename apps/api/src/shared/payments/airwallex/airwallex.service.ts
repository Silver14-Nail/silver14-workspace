import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AirwallexConfig } from '@/config/airwallex.config';
import type {
  AirwallexAuthToken,
  AirwallexCheckoutSession,
  AirwallexCreateCheckoutSessionParams,
  AirwallexCreatePaymentIntentParams,
  AirwallexCustomer,
  AirwallexCreateCustomerParams,
  AirwallexPaymentIntent,
  AirwallexPaymentMethod,
  AirwallexRefund,
  AirwallexCreateRefundParams,
} from './types/airwallex.types';

/**
 * Pure Airwallex API client — no database access, no business logic.
 *
 * Responsible for:
 *   - OAuth 2.0 token management (auto-refresh on expiry)
 *   - Payment Intent CRUD
 *   - Checkout Session creation
 *   - Customer creation & retrieval
 *   - Payment Method management (saved cards)
 *   - Refund creation & inquiry
 *   - Webhook signature verification
 *   - Recurring payment processing
 */
@Injectable()
export class AirwallexService {
  private readonly logger = new Logger(AirwallexService.name);
  private readonly config: AirwallexConfig;

  private authToken: AirwallexAuthToken | null = null;
  private tokenPromise: Promise<AirwallexAuthToken> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<AirwallexConfig>('airwallex');
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  /**
   * Returns a valid bearer token, acquiring or refreshing as needed.
   * Uses a promise-lock pattern to prevent concurrent token requests.
   */
  async getBearerToken(): Promise<string> {
    if (this.authToken && this.authToken.expiresAt > new Date()) {
      return this.authToken.token;
    }

    if (!this.tokenPromise) {
      this.tokenPromise = this.acquireToken();
    }

    try {
      this.authToken = await this.tokenPromise;
      return this.authToken.token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async acquireToken(): Promise<AirwallexAuthToken> {
    this.logger.debug('Acquiring Airwallex OAuth token');

    const response = await this.httpRequest<{
      token: string;
      expiresIn: number;
      tokenType: string;
    }>('POST', `${this.config.baseUrl}/api/v1/authentication/login`, '', {
      'x-client-id': this.config.clientId,
      'x-api-key': this.config.apiKey,
    });

    const expiresAt = new Date(Date.now() + (response.expiresIn - 60) * 1000); // 1min buffer

    this.logger.debug('Airwallex OAuth token acquired');

    return {
      token: response.token,
      expiresAt,
    };
  }

  // ─── Payment Intents ──────────────────────────────────────────────────────

  /**
   * Creates a Payment Intent.
   * https://www.airwallex.com/docs/api#/Payment_Intents/Create_a_Payment_Intent
   */
  async createPaymentIntent(
    params: AirwallexCreatePaymentIntentParams,
  ): Promise<AirwallexPaymentIntent> {
    const token = await this.getBearerToken();

    const body: Record<string, any> = {
      amount: params.amount,
      currency: params.currency.toUpperCase(),
    };

    if (params.merchantOrderId) body.merchant_order_id = params.merchantOrderId;
    if (params.paymentMethodOptions) body.payment_method_options = params.paymentMethodOptions;
    if (params.metadata) body.metadata = params.metadata;
    if (params.returnUrl) body.return_url = params.returnUrl;
    if (params.requestId) body.request_id = params.requestId;

    return this.httpRequest<AirwallexPaymentIntent>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/payment_intents/create`,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Retrieves a Payment Intent by ID.
   * https://www.airwallex.com/docs/api#/Payment_Intents/Retrieve_a_Payment_Intent
   */
  async retrievePaymentIntent(intentId: string): Promise<AirwallexPaymentIntent> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexPaymentIntent>(
      'GET',
      `${this.config.baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(intentId)}`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Confirms a Payment Intent with a payment method.
   * https://www.airwallex.com/docs/api#/Payment_Intents/Confirm_a_Payment_Intent
   */
  async confirmPaymentIntent(
    intentId: string,
    paymentMethodId: string,
  ): Promise<AirwallexPaymentIntent> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexPaymentIntent>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(intentId)}/confirm`,
      JSON.stringify({ payment_method_id: paymentMethodId }),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Cancels a Payment Intent.
   */
  async cancelPaymentIntent(intentId: string): Promise<AirwallexPaymentIntent> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexPaymentIntent>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(intentId)}/cancel`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Checkout Sessions ────────────────────────────────────────────────────

  /**
   * Creates a hosted Checkout Session (Managed).
   * https://www.airwallex.com/docs/api#/Payment_Intents/Create_a_Payment_Intent
   * Airwallex Checkout creates a Payment Intent internally and returns a URL.
   */
  async createCheckoutSession(
    params: AirwallexCreateCheckoutSessionParams,
  ): Promise<AirwallexCheckoutSession> {
    const token = await this.getBearerToken();

    const body: Record<string, any> = {
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      return_url: params.returnUrl,
    };

    if (params.merchantOrderId) body.merchant_order_id = params.merchantOrderId;
    if (params.cancelUrl) body.cancel_url = params.cancelUrl;
    if (params.metadata) body.metadata = params.metadata;
    if (params.customerId) body.customer_id = params.customerId;
    if (params.customer) body.customer = params.customer;

    // Default to card if no types specified
    body.payment_method_options = {
      type: params.paymentMethodOptions?.type ?? ['card'],
      ...(params.paymentMethodOptions?.card?.allowSaveCard !== undefined
        ? { card: { allow_save_card: params.paymentMethodOptions.card.allowSaveCard } }
        : {}),
    };

    return this.httpRequest<AirwallexCheckoutSession>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/checkout_sessions/create`,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Retrieves a Checkout Session by ID.
   */
  async retrieveCheckoutSession(sessionId: string): Promise<AirwallexCheckoutSession> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexCheckoutSession>(
      'GET',
      `${this.config.baseUrl}/api/v1/pa/checkout_sessions/${encodeURIComponent(sessionId)}`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  /**
   * Creates a customer for saved-card/recurring flows.
   * https://www.airwallex.com/docs/api#/Customers/Create_a_customer
   */
  async createCustomer(params: AirwallexCreateCustomerParams): Promise<AirwallexCustomer> {
    const token = await this.getBearerToken();

    const body: Record<string, any> = {};
    if (params.merchantCustomerId) body.merchant_customer_id = params.merchantCustomerId;
    if (params.email) body.email = params.email;
    if (params.firstName) body.first_name = params.firstName;
    if (params.lastName) body.last_name = params.lastName;
    if (params.phoneNumber) body.phone_number = params.phoneNumber;
    if (params.metadata) body.metadata = params.metadata;

    return this.httpRequest<AirwallexCustomer>(
      'POST',
      `${this.config.baseUrl}/api/v1/customers/create`,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Retrieves a customer by ID.
   */
  async retrieveCustomer(customerId: string): Promise<AirwallexCustomer> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexCustomer>(
      'GET',
      `${this.config.baseUrl}/api/v1/customers/${encodeURIComponent(customerId)}`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Payment Methods (Saved Cards) ───────────────────────────────────────

  /**
   * Attaches a Payment Method to a customer (saves the card).
   */
  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<AirwallexPaymentMethod> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexPaymentMethod>(
      'POST',
      `${this.config.baseUrl}/api/v1/payment_methods/${encodeURIComponent(paymentMethodId)}/attach`,
      JSON.stringify({ customer_id: customerId }),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Lists payment methods for a customer (saved cards).
   */
  async listCustomerPaymentMethods(
    customerId: string,
    type?: 'card',
  ): Promise<{ items: AirwallexPaymentMethod[] }> {
    const token = await this.getBearerToken();

    let path = `/api/v1/payment_methods?customer_id=${encodeURIComponent(customerId)}`;
    if (type) path += `&type=${encodeURIComponent(type)}`;

    return this.httpRequest<{ items: AirwallexPaymentMethod[] }>(
      'GET',
      `${this.config.baseUrl}${path}`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Recurring Payment ────────────────────────────────────────────────────

  /**
   * Creates a Payment Intent using a saved payment method (card-on-file).
   * This enables future recurring/off-session payments.
   */
  async createRecurringPaymentIntent(params: {
    paymentMethodId: string;
    amount: number;
    currency: string;
    merchantOrderId?: string;
    metadata?: Record<string, string>;
    requestId?: string;
  }): Promise<AirwallexPaymentIntent> {
    const token = await this.getBearerToken();

    const body: Record<string, any> = {
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      payment_method_id: params.paymentMethodId,
      // Airwallex uses payment_method_options.cardless_payment type for recurring
      payment_method_options: {
        type: ['card'],
        card: {
          // Setting this enables off-session recurring usage
          recurring: true,
        },
      },
    };

    if (params.merchantOrderId) body.merchant_order_id = params.merchantOrderId;
    if (params.metadata) body.metadata = params.metadata;

    return this.httpRequest<AirwallexPaymentIntent>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/payment_intents/create`,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Refunds ──────────────────────────────────────────────────────────────

  /**
   * Creates a refund for a Payment Intent.
   * https://www.airwallex.com/docs/api#/Payment_Intents/Create_a_Refund
   */
  async createRefund(params: AirwallexCreateRefundParams): Promise<AirwallexRefund> {
    const token = await this.getBearerToken();

    const body: Record<string, any> = {
      payment_intent_id: params.paymentIntentId,
    };

    if (params.amount !== undefined) body.amount = params.amount;
    if (params.currency) body.currency = params.currency.toUpperCase();
    if (params.reason) body.reason = params.reason;
    if (params.metadata) body.metadata = params.metadata;
    if (params.requestId) body.request_id = params.requestId;

    return this.httpRequest<AirwallexRefund>(
      'POST',
      `${this.config.baseUrl}/api/v1/pa/refunds/create`,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    );
  }

  /**
   * Retrieves a Refund by ID.
   */
  async retrieveRefund(refundId: string): Promise<AirwallexRefund> {
    const token = await this.getBearerToken();

    return this.httpRequest<AirwallexRefund>(
      'GET',
      `${this.config.baseUrl}/api/v1/pa/refunds/${encodeURIComponent(refundId)}`,
      '',
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  // ─── Inquiry ──────────────────────────────────────────────────────────────

  /**
   * Generic resource inquiry — retrieves any resource by type and ID.
   */
  async inquireResource(
    resourceType: 'payment_intent' | 'refund' | 'checkout_session',
    resourceId: string,
  ): Promise<Record<string, any>> {
    const token = await this.getBearerToken();

    const pathMap: Record<string, string> = {
      payment_intent: `/api/v1/pa/payment_intents/${encodeURIComponent(resourceId)}`,
      refund: `/api/v1/pa/refunds/${encodeURIComponent(resourceId)}`,
      checkout_session: `/api/v1/pa/checkout_sessions/${encodeURIComponent(resourceId)}`,
    };

    const path = pathMap[resourceType];
    if (!path) {
      throw new Error(`Unknown Airwallex resource type: ${resourceType}`);
    }

    return this.httpRequest<Record<string, any>>('GET', `${this.config.baseUrl}${path}`, '', {
      Authorization: `Bearer ${token}`,
    });
  }

  // ─── Webhook Verification ────────────────────────────────────────────────

  /**
   * Verifies an Airwallex webhook payload using HMAC-SHA256.
   *
   * Airwallex signs webhooks with:
   *   Signature = HMAC-SHA256(request_body, webhook_secret)
   *
   * The signature is sent in the `x-signature` header.
   * This method performs a constant-time comparison to prevent timing attacks.
   *
   * @param rawBody - The raw request body as a string.
   * @param signatureHeader - The value of the `x-signature` header.
   * @returns true if the signature is valid, false otherwise.
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!rawBody || !signatureHeader) {
      this.logger.warn('Airwallex webhook: missing body or signature header');
      return false;
    }

    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    try {
      const expectedBuf = Buffer.from(expected, 'utf8');
      const actualBuf = Buffer.from(signatureHeader, 'utf8');

      if (expectedBuf.length !== actualBuf.length) return false;

      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }

  // ─── HTTP Utilities ───────────────────────────────────────────────────────

  private httpRequest<T>(
    method: string,
    rawUrl: string,
    body: string,
    extraHeaders: Record<string, string>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(rawUrl);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const headers: Record<string, string> = {
        ...extraHeaders,
      };

      if (body) {
        headers['Content-Length'] = String(Buffer.byteLength(body));
      }

      const options: https.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port, 10) : isHttps ? 443 : 80,
        path: urlObj.pathname + urlObj.search,
        method,
        headers,
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          const statusCode = res.statusCode ?? 500;

          try {
            const parsed = JSON.parse(data);

            if (statusCode >= 200 && statusCode < 300) {
              resolve(this.snakeToCamel(parsed) as T);
            } else {
              const errorMsg =
                parsed?.message ?? parsed?.error ?? `Airwallex API error — status ${statusCode}`;
              reject(new Error(`Airwallex (${method} ${rawUrl}): ${errorMsg}`));
            }
          } catch {
            if (statusCode >= 200 && statusCode < 300) {
              // Some endpoints return non-JSON on success
              resolve(data as unknown as T);
            } else {
              reject(
                new Error(`Airwallex API error — status ${statusCode}: ${data.slice(0, 500)}`),
              );
            }
          }
        });
      });

      req.on('error', (err: Error) =>
        reject(new Error(`Airwallex HTTP error (${method} ${rawUrl}): ${err.message}`)),
      );

      if (body) req.write(body);
      req.end();
    });
  }

  // Recursively converts snake_case keys to camelCase so our typed interfaces work
  // against the raw Airwallex JSON response.
  private snakeToCamel(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((v) => this.snakeToCamel(v));
    }
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
          this.snakeToCamel(v),
        ]),
      );
    }
    return value;
  }
}
