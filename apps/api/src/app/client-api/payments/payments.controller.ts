import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

import { ClientPaymentsService } from './payments.service';
import { InitiateStripePaymentDto } from './dto/initiate-stripe-payment.dto';
import { ConfirmStripePaymentDto } from './dto/confirm-stripe-payment.dto';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

@ApiTags('Client - Payments')
@ApiBearerAuth()
@Controller('payments')
export class ClientPaymentsController {
  constructor(private readonly paymentsService: ClientPaymentsService) {}

  // ─── Stripe ─────────────────────────────────────────────────────────────────

  @Post('stripe/confirm')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Verifies Stripe payment with Stripe API and creates the order. Returns orderId.',
    schema: { properties: { orderId: { type: 'string' } } },
  })
  confirmStripe(@Body() dto: ConfirmStripePaymentDto) {
    return this.paymentsService.fulfillStripePayment(dto.paymentIntentId, dto.checkoutSessionId);
  }

  @Post('stripe/intent')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Returns clientSecret for Stripe.js and paymentIntentId',
    schema: {
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  initiateStripe(@Body() dto: InitiateStripePaymentDto) {
    return this.paymentsService.initiateStripePayment(dto);
  }

  // ─── PayPal ─────────────────────────────────────────────────────────────────

  @Post('paypal/create-order')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Returns PayPal orderId to use with PayPal JS SDK',
    schema: {
      properties: {
        paypalOrderId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  createPaypalOrder(@Body() dto: CreatePaypalOrderDto) {
    return this.paymentsService.createPaypalOrder(dto);
  }

  @Post('paypal/capture')
  @ApiCreatedResponse({
    description: 'PayPal payment captured. Returns created order and payment.',
  })
  capturePaypal(@Body() dto: CapturePaypalOrderDto) {
    return this.paymentsService.capturePaypalOrder(dto);
  }
}
