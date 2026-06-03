import * as crypto from 'crypto';
import * as https from 'https';
import { URL } from 'url';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { TwocheckoutConfig } from '@/config/twocheckout.config';
import type {
  TwocheckoutCreateOrderParams,
  TwocheckoutOrderResponse,
  TwocheckoutIpnPayload,
} from './types/twocheckout.types';

/**
 * Pure 2Checkout (Verifone) API client — no database access, no business logic.
 *
 * Uses the 2Checkout REST API 6.0 with HMAC-SHA256 authentication.
 * https://www.2checkout.com/documentation/api/
 */
@Injectable()
export class TwocheckoutService {
  private readonly logger = new Logger(TwocheckoutService.name);
  private readonly config: TwocheckoutConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<TwocheckoutConfig>('twocheckout');
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  /**
   * Generates the X-Avangate-Authentication header value.
   * hash = HMAC_SHA256(secretKey, len(merchantCode) + merchantCode + len(date) + date)
   */
  private buildAuthHeader(): string {
    const date = new Date()
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '');

    const { merchantCode, secretKey } = this.config;
    const stringToHash =
      `${merchantCode.length}${merchantCode}` + `${date.length}${date}`;

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(stringToHash)
      .digest('hex');

    return `code="${merchantCode}" date="${date}" hash="${hash}"`;
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  /**
   * Creates a 2Checkout order and returns the hosted payment redirect URL.
   * https://www.2checkout.com/documentation/api/orders/place-order/
   */
  async createOrder(params: TwocheckoutCreateOrderParams): Promise<TwocheckoutOrderResponse> {
    const body = {
      Currency: params.currency.toUpperCase(),
      Language: params.language ?? 'EN',
      Country: params.country,
      CustomerIP: params.customerIp,
      Source: 'WEB',
      MerchantOrderRef: params.merchantOrderRef,
      Items: params.items.map((item) => ({
        Name: item.name,
        Description: item.description ?? '',
        Quantity: item.quantity,
        Price: { Amount: item.price, Type: 'CUSTOM' },
        Type: 'PRODUCT',
      })),
      BillingDetails: params.billing,
      PaymentDetails: {
        Type: 'EES_TOKEN_PAYMENT',
        Currency: params.currency.toUpperCase(),
        PaymentMethod: {
          ReturnURL: params.returnUrl,
          CancelURL: params.cancelUrl,
        },
      },
    };

    this.logger.debug(`Creating 2Checkout order: ${params.merchantOrderRef}`);

    const response = await this.httpRequest<TwocheckoutOrderResponse>(
      'POST',
      `${this.config.baseUrl}/rest/6.0/orders/`,
      JSON.stringify(body),
    );

    this.logger.log(
      `2Checkout order created: RefNo=${response.RefNo}, ref=${params.merchantOrderRef}`,
    );

    return response;
  }

  /**
   * Retrieves an order by 2Checkout reference number.
   */
  async getOrder(refNo: string): Promise<TwocheckoutOrderResponse> {
    return this.httpRequest<TwocheckoutOrderResponse>(
      'GET',
      `${this.config.baseUrl}/rest/6.0/orders/${encodeURIComponent(refNo)}/`,
      '',
    );
  }

  // ─── IPN Verification ─────────────────────────────────────────────────────

  /**
   * Verifies a 2Checkout IPN (Instant Payment Notification) webhook.
   *
   * 2Checkout sends an HMAC-MD5 hash computed over specific IPN parameters.
   * We recompute and compare using constant-time equality.
   *
   * Hash input = HMAC_MD5(secretKey, len(val1) + val1 + len(val2) + val2 + ...)
   * over: IPN_PID[], IPN_PNAME[], IPN_DATE, DATE
   */
  verifyIpnSignature(payload: Record<string, string | string[]>): boolean {
    const { HASH: receivedHash } = payload;
    if (!receivedHash || typeof receivedHash !== 'string') return false;

    try {
      // Fields to hash per 2Checkout IPN spec
      const fieldsToHash: string[] = [];

      const addField = (v: string | string[] | undefined) => {
        if (v === undefined) return;
        const arr = Array.isArray(v) ? v : [v];
        arr.forEach((item) => fieldsToHash.push(`${item.length}${item}`));
      };

      addField(payload['IPN_PID[]'] ?? payload['IPN_PID']);
      addField(payload['IPN_PNAME[]'] ?? payload['IPN_PNAME']);
      addField(payload['IPN_DATE']);
      addField(payload['DATE']);

      const stringToHash = fieldsToHash.join('');
      const expectedHash = crypto
        .createHmac('md5', this.config.secretKey)
        .update(stringToHash)
        .digest('hex');

      const a = Buffer.from(expectedHash, 'utf8');
      const b = Buffer.from(receivedHash as string, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Builds the IPN response string that 2Checkout expects to receive.
   * Format: <DATE>|AUTORIZED (or INVALID)
   * 2Checkout will retry IPN if it doesn't get this response within 30s.
   */
  buildIpnResponse(ipnDate: string, accepted: boolean): string {
    const status = accepted ? 'AUTORIZED' : 'INVALID';
    const response = `${ipnDate}|${status}`;
    const hash = crypto
      .createHmac('md5', this.config.secretKey)
      .update(response)
      .digest('hex');
    return `<EPAYMENT>${ipnDate}|${hash}</EPAYMENT>`;
  }

  // ─── HTTP Utilities ───────────────────────────────────────────────────────

  private httpRequest<T>(method: string, rawUrl: string, body: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(rawUrl);
      const authHeader = this.buildAuthHeader();

      const headers: Record<string, string | number> = {
        'X-Avangate-Authentication': authHeader,
        Accept: 'application/json',
      };

      if (body) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(body);
      }

      const options: https.RequestOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method,
        headers,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          const statusCode = res.statusCode ?? 500;
          try {
            const parsed = JSON.parse(data);
            if (statusCode >= 200 && statusCode < 300) {
              resolve(parsed as T);
            } else {
              const msg = parsed?.message ?? parsed?.error_message ?? `status ${statusCode}`;
              this.logger.error(`2Checkout error response: ${JSON.stringify(parsed)}`);
              reject(new Error(`2Checkout (${method} ${rawUrl}): ${msg}`));
            }
          } catch {
            reject(new Error(`2Checkout API error — status ${statusCode}: ${data.slice(0, 300)}`));
          }
        });
      });

      req.on('error', (err: Error) =>
        reject(new Error(`2Checkout HTTP error (${method} ${rawUrl}): ${err.message}`)),
      );

      if (body) req.write(body);
      req.end();
    });
  }
}
