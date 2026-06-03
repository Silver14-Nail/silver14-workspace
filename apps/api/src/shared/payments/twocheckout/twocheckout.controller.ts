import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { TwocheckoutFulfillmentService } from './twocheckout-fulfillment.service';
import { TwocheckoutCheckoutDto } from './dto/twocheckout-checkout.dto';

@ApiTags('Client - 2Checkout')
@ApiBearerAuth()
@Controller('payments/twocheckout')
export class TwocheckoutController {
  constructor(private readonly fulfillmentService: TwocheckoutFulfillmentService) {}

  /**
   * POST /client-api/payments/twocheckout/checkout
   *
   * Creates a 2Checkout hosted-checkout order.
   * Returns a paymentUrl — the frontend should redirect the customer to this URL.
   */
  @Post('checkout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create 2Checkout hosted checkout',
    description:
      'Creates a 2Checkout payment order. ' +
      'The frontend should redirect the customer to the returned paymentUrl.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        paymentUrl: { type: 'string' },
        refNo: { type: 'string', nullable: true },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  createCheckout(@Body() dto: TwocheckoutCheckoutDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '127.0.0.1';

    return this.fulfillmentService.createCheckout(
      dto.checkoutSessionId,
      dto.returnUrl,
      dto.cancelUrl ?? dto.returnUrl,
      ip,
    );
  }
}
