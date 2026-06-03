import { Controller, Get, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { OnepayFulfillmentService } from './onepay-fulfillment.service';
import type { OnepayReturnParams } from './types/onepay.types';

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

  constructor(private readonly fulfillmentService: OnepayFulfillmentService) {}

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
   * Verifies the callback, then returns JSON result to frontend.
   *
   * The frontend uses the result to show success/failure UI.
   */
  @Get('return')
  async handleReturn(
    @Query() query: OnepayReturnParams,
  ): Promise<{ success: boolean; orderId?: string; pending?: boolean; error?: string }> {
    this.logger.log(
      `OnePAY return — ref: ${query.vpc_MerchTxnRef}, code: ${query.vpc_TxnResponseCode}`,
    );

    const result = await this.fulfillmentService.fulfillFromCallback(query);

    this.logger.log(
      `OnePAY return result — success: ${result.success}, orderId: ${result.orderId}`,
    );

    return result;
  }
}
