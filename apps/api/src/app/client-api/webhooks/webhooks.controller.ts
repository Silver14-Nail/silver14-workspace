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

  @Post('lemon-squeezy')
  @HttpCode(200)
  async lsWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing X-Signature header for Lemon Squeezy webhook');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for Lemon Squeezy webhook verification');
    }
    await this.webhooksService.handleLsWebhook(req.rawBody.toString('utf8'), signature);
    return { received: true };
  }

  @Post('paypal')
  @HttpCode(200)
  async paypalWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for PayPal webhook verification');
    }
    await this.webhooksService.handlePaypalWebhook(req.rawBody.toString('utf8'), headers);
    return { received: true };
  }
}
