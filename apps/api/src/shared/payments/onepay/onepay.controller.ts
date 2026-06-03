import { Body, Controller, Get, Ip, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { OnepayFulfillmentService } from './onepay-fulfillment.service';

/**
 * OnePAY client-facing endpoints (all require JWT auth).
 *
 * POST /client-api/payments/onepay/initiate
 *   Creates OnePAY payment session → returns redirect URL
 *
 * GET  /client-api/payments/onepay/inquiry/:ref
 *   Queries OnePAY transaction status via QueryDR
 */
@ApiTags('Client - OnePAY')
@ApiBearerAuth()
@Controller('payments/onepay')
export class OnepayController {
  private readonly logger = new Logger(OnepayController.name);

  constructor(private readonly fulfillmentService: OnepayFulfillmentService) {}

  /**
   * POST /client-api/payments/onepay/initiate
   *
   * Creates the signed OnePAY redirect URL.
   * Frontend must redirect the browser (window.location.href) to `redirectUrl`.
   */
  @Post('initiate')
  @ApiOperation({ summary: 'Create OnePAY payment redirect URL' })
  async initiate(
    @Body()
    body: {
      checkoutSessionId: string;
      /** Optional card list filter: INTERNATIONAL | DOMESTIC | QR | BNPL | BIN code */
      cardList?: string;
      /** Optional VND exchange rate if session currency is not VND */
      vndRate?: number;
    },
    @Ip() clientIp: string,
  ) {
    return this.fulfillmentService.createPayment(
      body.checkoutSessionId,
      clientIp || '127.0.0.1',
      body.cardList,
      body.vndRate,
    );
  }

  /**
   * GET /client-api/payments/onepay/inquiry/:ref
   *
   * Calls OnePAY QueryDR to check the current status of a transaction.
   * ref = vpc_MerchTxnRef sent at initiate time.
   */
  @Get('inquiry/:ref')
  @ApiOperation({ summary: 'Query OnePAY transaction status (QueryDR)' })
  async inquiry(@Param('ref') ref: string) {
    return this.fulfillmentService.inquireAndUpdate(ref);
  }
}
