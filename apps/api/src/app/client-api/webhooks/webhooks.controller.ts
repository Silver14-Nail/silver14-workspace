import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  BadRequestException,
  type RawBodyRequest,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import type { IncomingHttpHeaders } from 'http';

import { WebhooksService } from './webhooks.service';

@ApiExcludeController()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for Stripe webhook verification');
    }

    await this.webhooksService.handleStripeWebhook(req.rawBody, signature);
    return { received: true };
  }

  @Post('paypal')
  @HttpCode(200)
  async paypalWebhook(@Req() req: Request, @Headers() headers: IncomingHttpHeaders) {
    const rawBody = JSON.stringify(req.body);
    await this.webhooksService.handlePaypalWebhook(rawBody, headers);
    return { received: true };
  }
}
