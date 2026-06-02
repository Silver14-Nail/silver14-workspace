import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AirwallexFulfillmentService } from './airwallex-fulfillment.service';
import { AirwallexService } from './airwallex.service';

/**
 * Receives asynchronous event notifications from Airwallex.
 *
 * Excluded from Swagger — these endpoints are not called by the frontend.
 *
 * Security model:
 *   - Authenticity proven by HMAC-SHA256 signature over the raw body
 *   - Signature compared using constant-time equality
 *   - No JWT auth (Airwallex servers have no token)
 *   - All processing is idempotent
 */
@ApiExcludeController()
@Controller('webhooks/airwallex')
export class AirwallexWebhookController {
  private readonly logger = new Logger(AirwallexWebhookController.name);

  constructor(
    private readonly airwallexService: AirwallexService,
    private readonly fulfillmentService: AirwallexFulfillmentService,
  ) {}

  /**
   * POST /client-api/webhooks/airwallex
   *
   * Airwallex posts JSON events with signature in the `x-signature` header.
   *
   * Returns 200 for verified payloads so Airwallex stops retrying.
   * Returns 400 for invalid signatures so Airwallex knows something is wrong.
   * 500 for transient errors triggers Airwallex retries.
   */
  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ): Promise<{ received: true }> {
    const rawBody = (req as any).rawBody as string | undefined;

    if (!rawBody) {
      throw new BadRequestException('Airwallex webhook: missing raw body');
    }

    if (!signature) {
      throw new BadRequestException('Airwallex webhook: missing x-signature header');
    }

    // Verify signature
    const isValid = this.airwallexService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.error('Airwallex webhook: invalid signature — payload rejected');
      throw new BadRequestException('Airwallex webhook: invalid signature');
    }

    // Parse the verified event
    let event: { type: string; data: Record<string, any> };
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new BadRequestException('Airwallex webhook: invalid JSON body');
    }

    this.logger.log(`Airwallex webhook received: ${event.type} (id: ${(event as any).id})`);

    // Process the event (idempotent)
    await this.fulfillmentService.fulfillFromWebhook(event.type, event.data);

    return { received: true };
  }
}
