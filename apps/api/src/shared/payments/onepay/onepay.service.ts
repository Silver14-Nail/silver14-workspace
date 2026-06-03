import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { OnepayConfig } from '@/config/onepay.config';
import type {
  OnepayPaymentParams,
  OnepayQueryDrResponse,
  OnepayReturnParams,
} from './types/onepay.types';
import { ONEPAY_SUCCESS_CODE } from './types/onepay.types';

/**
 * Pure OnePAY API client — no database, no business logic.
 *
 * Implements:
 *  1. buildRedirectUrl() — creates the HTTPS GET URL with HMAC-SHA256 signature
 *  2. verifyHash()        — validates the signature on return/IPN callbacks
 *  3. queryDr()           — QueryDR POST to check transaction status
 *
 * Hash algorithm (per spec §II.8):
 *  - Take all vpc_* (and user_*) params, sorted alphabetically
 *  - Concatenate as "key=value&key=value..."
 *  - HMAC-SHA256 with SECURE_SECRET (hashKey), hex output (64 chars)
 */
@Injectable()
export class OnepayService {
  private readonly logger = new Logger(OnepayService.name);
  private readonly config: OnepayConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<OnepayConfig>('onepay');
  }

  // ─── Redirect URL Builder ─────────────────────────────────────────────────

  /**
   * Builds the full OnePAY redirect URL that the browser must be navigated to.
   *
   * @param params  Dynamic per-order fields
   * @param clientIp  Customer IP address (required by OnePAY as vpc_TicketNo)
   * @returns  Full HTTPS URL including vpc_SecureHash
   */
  buildRedirectUrl(params: OnepayPaymentParams): string {
    const staticParams: Record<string, string> = {
      vpc_Version: '2',
      vpc_Command: 'pay',
      vpc_Currency: 'VND',
      vpc_Locale: params.locale ?? 'vn',
      vpc_AccessCode: this.config.accessCode,
      vpc_Merchant: this.config.merchantId,
      vpc_ReturnURL: this.config.returnUrl,
      Title: this.config.title,
      AgainLink: params.AgainLink ?? this.config.returnUrl,
    };

    const dynamicParams: Record<string, string> = {
      vpc_MerchTxnRef: params.vpc_MerchTxnRef,
      vpc_OrderInfo: params.vpc_OrderInfo,
      vpc_Amount: params.vpc_Amount,
      vpc_TicketNo: params.vpc_TicketNo,
    };

    if (params.vpc_CardList) dynamicParams['vpc_CardList'] = params.vpc_CardList;
    if (params.vpc_Customer_Phone) dynamicParams['vpc_Customer_Phone'] = params.vpc_Customer_Phone;
    if (params.vpc_Customer_Email) dynamicParams['vpc_Customer_Email'] = params.vpc_Customer_Email;
    if (params.vpc_Customer_Id) dynamicParams['vpc_Customer_Id'] = params.vpc_Customer_Id;

    const allParams = { ...staticParams, ...dynamicParams };
    const secureHash = this.computeHash(allParams);

    const url = new URL(this.config.payGateUrl);
    for (const [k, v] of Object.entries(allParams)) {
      url.searchParams.set(k, v);
    }
    url.searchParams.set('vpc_SecureHash', secureHash);

    return url.toString();
  }

  // ─── Hash Verification ────────────────────────────────────────────────────

  /**
   * Verifies the HMAC-SHA256 signature on a return URL / IPN callback.
   *
   * Per spec §II.8: exclude vpc_SecureHash itself, sort remaining vpc_/user_ params
   * alphabetically, then HMAC-SHA256 with hashKey.
   */
  verifyHash(params: OnepayReturnParams): boolean {
    const receivedHash = params['vpc_SecureHash'];
    if (!receivedHash) return false;

    const filteredParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (
        v !== undefined &&
        (k.startsWith('vpc_') || k.startsWith('user_')) &&
        k !== 'vpc_SecureHash'
      ) {
        filteredParams[k] = v;
      }
    }

    const computed = this.computeHash(filteredParams);
    return computed.toLowerCase() === receivedHash.toLowerCase();
  }

  // ─── QueryDR ─────────────────────────────────────────────────────────────

  /**
   * Queries OnePAY for the status of a transaction by merchant transaction ref.
   *
   * POST application/x-www-form-urlencoded to queryDrUrl.
   */
  async queryDr(merchTxnRef: string): Promise<OnepayQueryDrResponse> {
    const reqParams: Record<string, string> = {
      vpc_Command: 'queryDR',
      vpc_Version: '2',
      vpc_MerchTxnRef: merchTxnRef,
      vpc_Merchant: this.config.merchantId,
      vpc_AccessCode: this.config.accessCode,
      vpc_User: this.config.user,
      vpc_Password: this.config.password,
    };

    const secureHash = this.computeHash(reqParams);
    reqParams['vpc_SecureHash'] = secureHash;

    const body = new URLSearchParams(reqParams).toString();

    this.logger.debug(`OnePAY QueryDR → ${this.config.queryDrUrl} [${merchTxnRef}]`);

    const raw = await this.httpPostForm(this.config.queryDrUrl, body);
    this.logger.debug(`OnePAY QueryDR ← ${JSON.stringify(raw)}`);

    return raw as OnepayQueryDrResponse;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Returns true if the response code indicates a successful transaction.
   * Per spec: only code "0" is success.
   */
  isSuccess(txnResponseCode: string | undefined): boolean {
    return txnResponseCode === ONEPAY_SUCCESS_CODE;
  }

  /**
   * Converts a currency amount to OnePAY wire amount (smallest unit × 100).
   * Works for any currency: VND 25,000 → 2,500,000 | USD 17.50 → 1,750
   */
  toOnepayAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Converts OnePAY wire amount back to real amount.
   */
  fromOnepayAmount(onepayAmount: number): number {
    return onepayAmount / 100;
  }

  /**
   * Generates a unique vpc_MerchTxnRef from a checkoutSessionId.
   * Format: first 32 chars of sessionId + 8-char hex timestamp suffix
   * Total max 40 chars (OnePAY limit).
   */
  buildMerchTxnRef(checkoutSessionId: string): string {
    const base = checkoutSessionId.replace(/-/g, '').slice(0, 32);
    const suffix = Date.now().toString(16).slice(-8);
    return `${base}${suffix}`.slice(0, 40);
  }

  // ─── Private: HMAC-SHA256 ────────────────────────────────────────────────

  /**
   * Computes HMAC-SHA256 over the sorted vpc_/user_ params.
   * Per spec §II.8:
   *  1. Filter only vpc_/user_ keys (exclude vpc_SecureHash)
   *  2. Sort alphabetically
   *  3. Join as "key=value&key=value..."
   *  4. HMAC-SHA256 with hashKey → hex (64 chars)
   */
  computeHash(params: Record<string, string>): string {
    // Per spec §II.8 + PHP ksort: use ASCII/binary comparison
    // (uppercase letters U+0041–U+005A are less-than lowercase U+0061–U+007A)
    const filtered = Object.entries(params)
      .filter(([k]) => (k.startsWith('vpc_') || k.startsWith('user_')) && k !== 'vpc_SecureHash')
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    const data = filtered.map(([k, v]) => `${k}=${v}`).join('&');

    return crypto
      .createHmac('sha256', Buffer.from(this.config.hashKey, 'hex'))
      .update(data)
      .digest('hex');
  }

  // ─── HTTP client ──────────────────────────────────────────────────────────

  private httpPostForm(url: string, body: string): Promise<Record<string, string>> {
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
          try {
            // QueryDR returns JSON
            resolve(JSON.parse(data) as Record<string, string>);
          } catch {
            reject(new Error(`OnePAY QueryDR non-JSON response: ${data.slice(0, 500)}`));
          }
        });
      });

      req.on('error', (err: Error) => reject(new Error(`OnePAY HTTP error: ${err.message}`)));

      req.write(body);
      req.end();
    });
  }
}
