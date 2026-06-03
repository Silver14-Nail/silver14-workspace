import { Controller, HttpCode, Logger, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { TwocheckoutService } from './twocheckout.service';
import { TwocheckoutFulfillmentService } from './twocheckout-fulfillment.service';

/**
 * Receives 2Checkout IPN (Instant Payment Notification) callbacks.
 *
 * Security model:
 *   - Authenticity proven by HMAC-MD5 hash over specific IPN fields
 *   - All processing is idempotent
 *   - Returns <EPAYMENT> response so 2Checkout stops retrying
 */
@ApiExcludeController()
@Controller('webhooks/twocheckout')
export class TwocheckoutWebhookController {
  private readonly logger = new Logger(TwocheckoutWebhookController.name);

  constructor(
    private readonly twocheckoutService: TwocheckoutService,
    private readonly fulfillmentService: TwocheckoutFulfillmentService,
  ) {}

  /**
   * POST /client-api/webhooks/twocheckout
   *
   * 2Checkout posts form-encoded IPN data with a HASH field.
   * We verify, fulfill, and respond with <EPAYMENT>DATE|HASH</EPAYMENT>.
   */
  @Post()
  @HttpCode(200)
  async handleIpn(@Req() req: Request, @Res() res: Response): Promise<void> {
    const payload = req.body as Record<string, string | string[]>;
    const ipnDate = (payload['IPN_DATE'] as string) ?? '';

    this.logger.log(
      `2Checkout IPN received: REFNO=${payload['REFNO']}, status=${payload['ORDERSTATUS']}`,
    );

    const isValid = this.twocheckoutService.verifyIpnSignature(payload);

    if (!isValid) {
      this.logger.error('2Checkout IPN: invalid signature — payload rejected');
      res.status(200).send(this.twocheckoutService.buildIpnResponse(ipnDate, false));
      return;
    }

    try {
      await this.fulfillmentService.fulfillFromIpn(payload);
    } catch (err) {
      this.logger.error(`2Checkout IPN fulfillment error: ${(err as Error).message}`);
      // Still respond 200 so 2Checkout doesn't retry indefinitely for non-retriable errors
    }

    res.status(200).send(this.twocheckoutService.buildIpnResponse(ipnDate, true));
  }
}
