import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { NgLuongFulfillmentService } from './nganluong-fulfillment.service';

/**
 * Ngân Lượng payment controller — client-side endpoints.
 *
 * All endpoints require JWT auth (UserApiMiddleware bypasses only webhooks).
 */
@ApiTags('Client - NgLuong')
@ApiBearerAuth()
@Controller('payments/nganluong')
export class NgLuongController {
  private readonly logger = new Logger(NgLuongController.name);

  constructor(private readonly fulfillmentService: NgLuongFulfillmentService) {}

  /**
   * POST /client-api/payments/nganluong/initiate
   *
   * Creates a Ngân Lượng order and returns the checkout_url.
   * Frontend redirects the browser to checkout_url.
   */
  @Post('initiate')
  @ApiOperation({ summary: 'Create Ngân Lượng payment order' })
  async initiate(
    @Body()
    body: {
      checkoutSessionId: string;
      paymentMethod: string;
      bankCode: string;
      orderDescription?: string;
      vndRate?: number;
    },
  ) {
    const result = await this.fulfillmentService.createPayment(
      body.checkoutSessionId,
      body.paymentMethod,
      body.bankCode,
      body.orderDescription,
      body.vndRate,
    );

    return result;
  }

  /**
   * GET /client-api/payments/nganluong/inquiry/:token
   *
   * Queries Ngân Lượng for the current order status.
   */
  @Get('inquiry/:token')
  @ApiOperation({ summary: 'Inquire Ngân Lượng payment status' })
  async inquire(@Param('token') token: string) {
    return this.fulfillmentService.inquireAndUpdate(token);
  }
}
