import { Controller, Get, HttpCode, Logger, Post, Query, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { OnepayFulfillmentService } from './onepay-fulfillment.service';
import type { OnepayReturnParams } from './types/onepay.types';
import type { OnepayConfig } from '@/config/onepay.config';

/**
 * Receives callbacks from OnePAY — excluded from Swagger.
 *
 * Security model:
 *  - No JWT auth (OnePAY servers have no token)
 *  - Authentication via HMAC-SHA256 signature on every call
 *  - All processing is idempotent
 *
 * Endpoints:
 *  GET  /client-api/webhooks/onepay/ipn     — IPN (server-to-server)
 *  POST /client-api/webhooks/onepay/ipn     — IPN (server-to-server, alternate method)
 *  GET  /client-api/webhooks/onepay/return  — Return URL (user browser redirect)
 */
@ApiExcludeController()
@Controller('webhooks/onepay')
export class OnepayIpnController {
  private readonly logger = new Logger(OnepayIpnController.name);

  private readonly storefrontUrl: string;

  constructor(
    private readonly fulfillmentService: OnepayFulfillmentService,
    private readonly configService: ConfigService,
  ) {
    this.storefrontUrl = this.configService.getOrThrow<OnepayConfig>('onepay').storefrontUrl;
  }

  /**
   * GET /client-api/webhooks/onepay/ipn
   * POST /client-api/webhooks/onepay/ipn
   *
   * OnePAY IPN — server-to-server notification.
   * Per spec §6.4: must respond with body "responsecode=1&desc=confirm-success"
   * This confirms receipt only, not transaction success.
   */
  @Get('ipn')
  @Post('ipn')
  @HttpCode(200)
  async handleIpn(@Query() query: OnepayReturnParams): Promise<string> {
    this.logger.log(
      `OnePAY IPN — ref: ${query.vpc_MerchTxnRef}, code: ${query.vpc_TxnResponseCode}`,
    );

    try {
      const result = await this.fulfillmentService.fulfillFromCallback(query);
      if (result.success) {
        this.logger.log(`OnePAY IPN fulfilled — order: ${result.orderId}`);
      } else if (result.pending) {
        this.logger.log(`OnePAY IPN pending — ref: ${query.vpc_MerchTxnRef}`);
      } else {
        this.logger.warn(`OnePAY IPN not fulfilled — error: ${result.error}`);
      }
    } catch (err: unknown) {
      this.logger.error(`OnePAY IPN error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // Per spec §6.4: always return this exact acknowledgement string
    return 'responsecode=1&desc=confirm-success';
  }

  /**
   * GET /client-api/webhooks/onepay/return
   *
   * OnePAY return URL — user's browser is redirected here after payment.
   * Verifies the callback, then redirects the user to the storefront.
   *
   * Success → /en/order/tracking?orderId=xxx
   * Failure → /en/checkout?error=payment_failed
   */
  @Get('return')
  async handleReturn(@Query() query: OnepayReturnParams, @Res() res: Response): Promise<void> {
    this.logger.log(
      `OnePAY return — ref: ${query.vpc_MerchTxnRef}, code: ${query.vpc_TxnResponseCode}`,
    );

    try {
      const result = await this.fulfillmentService.fulfillFromCallback(query);

      this.logger.log(
        `OnePAY return result — success: ${result.success}, orderId: ${result.orderId}`,
      );

      if (result.success && result.orderId) {
        // Use first 8 chars of UUID — tracking API supports prefix LIKE lookup
        const shortId = result.orderId.slice(0, 8);
        return res.redirect(
          `${this.storefrontUrl}/en/order/tracking?orderId=${encodeURIComponent(shortId)}&status=success`,
        );
      }

      if (result.pending) {
        return res.redirect(`${this.storefrontUrl}/en/order/tracking?status=pending`);
      }

      return res.redirect(`${this.storefrontUrl}/en/checkout?error=payment_failed`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`OnePAY return error: ${msg}`);
      return res.redirect(`${this.storefrontUrl}/en/checkout?error=payment_failed`);
    }
  }
}
