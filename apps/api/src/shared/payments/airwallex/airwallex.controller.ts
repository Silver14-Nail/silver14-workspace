import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AirwallexFulfillmentService } from './airwallex-fulfillment.service';
import { AirwallexRefundService } from './airwallex-refund.service';
import { AirwallexCreatePaymentIntentDto } from './dto/airwallex-create-payment-intent.dto';
import { AirwallexCreateCheckoutSessionDto } from './dto/airwallex-checkout-session.dto';
import { AirwallexRefundDto } from './dto/airwallex-refund.dto';
import { AirwallexConfirmPaymentDto } from './dto/airwallex-confirm.dto';

@ApiTags('Client - Airwallex')
@ApiBearerAuth()
@Controller('payments/airwallex')
export class AirwallexController {
  constructor(
    private readonly fulfillmentService: AirwallexFulfillmentService,
    private readonly refundService: AirwallexRefundService,
  ) {}

  // ─── Payment Intent ──────────────────────────────────────────────────────────

  @Post('payment-intent')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create Airwallex Payment Intent',
    description:
      'Creates a Payment Intent for direct Airwallex Elements integration. ' +
      'Returns the client_secret needed for the frontend to mount Airwallex.js Elements.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  createPaymentIntent(@Body() dto: AirwallexCreatePaymentIntentDto) {
    return this.fulfillmentService.createPaymentIntent(
      dto.checkoutSessionId,
      dto.amount,
      dto.paymentMethodTypes,
      dto.customerId,
    );
  }

  // ─── Checkout Session ─────────────────────────────────────────────────────────

  @Post('checkout-session')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create Airwallex Checkout Session',
    description:
      'Creates a hosted Airwallex Checkout Session. ' +
      'The frontend should redirect the customer to the returned url.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        checkoutSessionRef: { type: 'string' },
        url: { type: 'string' },
        clientSecret: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  createCheckoutSession(@Body() dto: AirwallexCreateCheckoutSessionDto) {
    return this.fulfillmentService.createCheckoutSession(
      dto.checkoutSessionId,
      dto.returnUrl,
      dto.cancelUrl,
      dto.amount,
      dto.paymentMethodTypes,
      dto.allowSaveCard,
      dto.customerId,
      dto.customer,
    );
  }

  // ─── Inquiry ──────────────────────────────────────────────────────────────────

  @Get('inquiry/:resourceType/:resourceId')
  @ApiOperation({
    summary: 'Inquire Airwallex resource status',
    description:
      'Calls the Airwallex inquiry API for a given resource type and ID. ' +
      'Returns the raw Airwallex response.',
  })
  @ApiOkResponse({ description: 'Raw Airwallex inquiry response' })
  inquireResource(
    @Param('resourceType') resourceType: 'payment_intent' | 'refund' | 'checkout_session',
    @Param('resourceId') resourceId: string,
  ) {
    return this.fulfillmentService.inquireAndUpdate(resourceType, resourceId);
  }

  // ─── Confirm (after client SDK payment) ─────────────────────────────────────

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm Airwallex payment and create order',
    description:
      'Called by the frontend after Airwallex Elements confirms the payment. ' +
      'Verifies the Payment Intent status with Airwallex, creates the order atomically. ' +
      'Idempotent — safe to call multiple times.',
  })
  @ApiOkResponse({
    schema: { properties: { orderId: { type: 'string' } } },
  })
  confirmPayment(@Body() dto: AirwallexConfirmPaymentDto) {
    return this.fulfillmentService.fulfillFromClientConfirm(
      dto.paymentIntentId,
      dto.checkoutSessionId,
    );
  }

  // ─── Refund ───────────────────────────────────────────────────────────────────

  @Post('refund')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refund an Airwallex payment',
    description:
      'Calls the Airwallex refund API. Supports full and partial refunds. ' +
      'Updates payment status to REFUNDED or PARTIALLY_REFUNDED accordingly.',
  })
  @ApiOkResponse({
    schema: { properties: { refundId: { type: 'string' } } },
  })
  refundPayment(@Body() dto: AirwallexRefundDto) {
    return this.refundService.refundPayment({
      paymentId: dto.paymentId,
      amountCents: dto.amount,
      reason: dto.reason,
    });
  }
}
