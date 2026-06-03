import { Controller, Get, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { NgLuongFulfillmentService } from './nganluong-fulfillment.service';
import type { NgLuongCallbackParams } from './types/nganluong.types';

/**
 * Receives Ngân Lượng callback notifications.
 *
 * Excluded from Swagger — these endpoints are not called by the frontend.
 *
 * Security model:
 *   - No JWT auth (Ngân Lượng servers have no token)
 *   - Authentication via order check (re-verify every callback)
 *   - All processing is idempotent
 *
 * Two callback paths:
 *   - GET /webhooks/nganluong — notify_url (server-to-server)
 *   - GET /webhooks/nganluong/return — return_url (user browser redirect)
 */
@ApiExcludeController()
@Controller('webhooks/nganluong')
export class NgLuongWebhookController {
  private readonly logger = new Logger(NgLuongWebhookController.name);

  constructor(private readonly fulfillmentService: NgLuongFulfillmentService) {}

  /**
   * GET /client-api/webhooks/nganluong
   *
   * Ngân Lượng notify_url — server-to-server POST/GET notification.
   * Always returns "responsecode=1&desc=confirm-success" so NgLuong knows we received it.
   */
  @Get()
  @Post()
  @HttpCode(200)
  async handleNotify(@Query() query: NgLuongCallbackParams) {
    this.logger.log(
      `NgLuong notify received — token: ${query.token}, error_code: ${query.error_code}`,
    );

    try {
      await this.fulfillmentService.fulfillFromCallback(query);
    } catch (err: unknown) {
      this.logger.error(`NgLuong notify error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // Ngân Lượng expects this exact confirmation string
    return 'responsecode=1&desc=confirm-success';
  }

  /**
   * GET /client-api/webhooks/nganluong/return
   *
   * Ngân Lượng return_url — user browser redirect after payment.
   * Verifies payment, then redirects to frontend checkout with result.
   */
  @Get('return')
  async handleReturn(@Query() query: NgLuongCallbackParams) {
    this.logger.log(
      `NgLuong return received — token: ${query.token}, error_code: ${query.error_code}`,
    );

    const result = await this.fulfillmentService.fulfillFromCallback(query);

    if (result.orderId) {
      return { success: true, orderId: result.orderId };
    }

    return { success: false, error: query.error_code };
  }
}
