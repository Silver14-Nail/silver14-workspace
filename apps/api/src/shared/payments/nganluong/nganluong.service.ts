import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { NgLuongConfig } from '@/config/nganluong.config';
import type {
  NgLuongCreateOrderParams,
  NgLuongCreateOrderResponse,
  NgLuongOrderCheckResponse,
} from './types/nganluong.types';

/**
 * Pure Ngân Lượng API client — no database access, no business logic.
 *
 * API v3.1:
 *   - SetExpressCheckout: POST form-data → returns checkout_url
 *   - Order Check: POST form-data → returns transaction status
 *   - Checksum: MD5(token + "|" + merchant_password)
 */
@Injectable()
export class NgLuongService {
  private readonly logger = new Logger(NgLuongService.name);
  private readonly config: NgLuongConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<NgLuongConfig>('nganLuong');
  }

  // ─── SetExpressCheckout ──────────────────────────────────────────────────

  /**
   * Creates a payment order on Ngân Lượng and returns the checkout_url.
   */
  async createOrder(params: NgLuongCreateOrderParams): Promise<NgLuongCreateOrderResponse> {
    const formData = new URLSearchParams();

    formData.append('merchant_id', this.config.merchantId);
    formData.append('merchant_password', this.config.merchantPasswordMd5);
    formData.append('version', '3.1');
    formData.append('function', 'SetExpressCheckout');
    formData.append('receiver_email', this.config.receiverEmail);
    formData.append('order_code', params.orderCode);
    formData.append('total_amount', String(Math.round(params.totalAmount)));
    formData.append('payment_method', params.paymentMethod);
    formData.append('bank_code', params.bankCode);
    formData.append('return_url', this.config.returnUrl);
    formData.append('notify_url', this.config.notifyUrl);
    formData.append('cancel_url', this.config.cancelUrl);
    formData.append('buyer_fullname', params.buyerFullname);
    formData.append('buyer_email', params.buyerEmail);
    formData.append('buyer_mobile', params.buyerMobile);

    if (params.orderDescription) formData.append('order_description', params.orderDescription);
    if (params.buyerAddress) formData.append('buyer_address', params.buyerAddress);
    if (params.curCode) formData.append('cur_code', params.curCode);
    if (params.langCode) formData.append('lang_code', params.langCode);
    if (params.timeLimit) formData.append('time_limit', String(params.timeLimit));

    const body = formData.toString();

    const response = await this.httpPostForm<{
      error_code: string;
      token: string;
      description: string;
      time_limit: string;
      checkout_url: string;
    }>(this.config.apiBaseUrl, body);

    return {
      error_code: response.error_code,
      token: response.token,
      description: response.description,
      time_limit: parseInt(response.time_limit, 10) || 1440,
      checkout_url: response.checkout_url,
    };
  }

  // ─── Order Check ─────────────────────────────────────────────────────────

  /**
   * Checks the status of an order via token.
   * Checksum = MD5(token + "|" + merchant_password)
   */
  async checkOrder(token: string): Promise<NgLuongOrderCheckResponse> {
    const checksum = crypto
      .createHash('md5')
      .update(`${token}|${this.config.merchantPassword}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('merchant_id', this.config.merchantId);
    formData.append('token', token);
    formData.append('checksum', checksum);

    const body = formData.toString();

    return this.httpPostForm<NgLuongOrderCheckResponse>(this.config.orderCheckUrl, body);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Returns true if the order was paid successfully.
   */
  isSuccessStatus(transactionStatus: string): boolean {
    return transactionStatus === '00';
  }

  /**
   * Ngân Lượng uses VND internally — amount is already in VND units.
   * Unlike OnePAY, Ngân Lượng does NOT require multiplying by 100.
   * total_amount = real VND amount (e.g. 25000 for 25,000₫)
   */
  toNgLuongAmount(vndAmount: number): number {
    return Math.round(vndAmount);
  }

  // ─── HTTP Client ─────────────────────────────────────────────────────────

  private httpPostForm<T>(url: string, body: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const options: https.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port, 10) : 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': String(Buffer.byteLength(body)),
        },
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          const statusCode = res.statusCode ?? 500;

          // Ngân Lượng returns XML for SetExpressCheckout
          const parsed = this.parseResponse(data, statusCode);
          if (parsed instanceof Error) {
            reject(parsed);
          } else {
            resolve(parsed as T);
          }
        });
      });

      req.on('error', (err: Error) => reject(new Error(`NgLuong HTTP error: ${err.message}`)));

      req.write(body);
      req.end();
    });
  }

  /**
   * Ngân Lượng SetExpressCheckout returns XML.
   * Order Check returns JSON.
   */
  private parseResponse(data: string, statusCode: number): Record<string, any> | Error {
    // Try JSON first (order check)
    try {
      const parsed = JSON.parse(data);
      if (parsed.error_code) {
        return parsed;
      }
    } catch {
      // Not JSON — likely XML
    }

    // Try XML (SetExpressCheckout)
    try {
      return this.parseXmlResponse(data);
    } catch {
      return new Error(`NgLuong API error — status ${statusCode}: ${data.slice(0, 500)}`);
    }
  }

  private parseXmlResponse(xml: string): Record<string, any> {
    const result: Record<string, string> = {};
    const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(xml)) !== null) {
      result[match[1]] = match[2].trim();
    }

    return result;
  }
}
