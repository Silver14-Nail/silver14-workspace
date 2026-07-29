import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiHeader,
} from '@nestjs/swagger';

import { OptionalCustomerJwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { MaybeCurrentUser } from '@/shared/auth/decorators/maybe-current-user.decorator';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { ClientCheckoutService } from './checkout.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { StartCheckoutDto } from './dto/start-checkout.dto';

@ApiTags('Client - Checkout')
@ApiBearerAuth()
@UseGuards(OptionalCustomerJwtAuthGuard)
@Controller('checkout')
export class ClientCheckoutController {
  constructor(private readonly checkoutService: ClientCheckoutService) {}

  @Get('shipping-methods')
  @ApiOkResponse({ description: 'List of active shipping methods' })
  listShippingMethods() {
    return this.checkoutService.listShippingMethods();
  }

  @Get('shipping-fee')
  @ApiOkResponse({ description: 'Zone-based shipping fee for a given country (ISO code or name)' })
  getShippingFee(@Query('country') country: string) {
    return this.checkoutService.getShippingFeeByCountry(country ?? '');
  }

  @Post()
  @ApiCreatedResponse({ description: 'Checkout session created from cart' })
  @ApiBadRequestResponse({ description: 'Cart is empty' })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  createSession(
    @Body() dto: CreateCheckoutSessionDto,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.checkoutService.createSession(dto, user?.id);
  }

  @Post('start')
  @ApiHeader({ name: 'x-cart-id', required: false, description: 'Guest cart ID (UUID)' })
  @ApiCreatedResponse({
    description:
      'One-shot fresh checkout: syncs cart items, creates the session, and saves contact info.',
  })
  startCheckout(
    @Body() dto: StartCheckoutDto,
    @Headers('x-cart-id') cartId: string | undefined,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.checkoutService.startCheckout(dto, user?.id, cartId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Checkout session with cart items and totals' })
  getSession(@Param('id') id: string) {
    return this.checkoutService.getSession(id);
  }

  @Get(':id/order')
  @ApiOkResponse({
    description: 'Order associated with this session, null if not yet created by webhook',
  })
  getSessionOrder(@Param('id') id: string) {
    return this.checkoutService.getSessionOrder(id);
  }

  @Patch(':id/contact')
  @ApiOkResponse({ description: 'Contact info saved, step advances to SHIPPING' })
  updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.checkoutService.updateContact(id, dto);
  }

  @Patch(':id/shipping')
  @ApiOkResponse({ description: 'Shipping saved, step advances to PAYMENT' })
  updateShipping(@Param('id') id: string, @Body() dto: UpdateShippingDto) {
    return this.checkoutService.updateShipping(id, dto);
  }

  @Post(':id/coupon')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Coupon applied, returns session with updated totals' })
  applyCoupon(@Param('id') id: string, @Body() dto: ApplyCouponDto) {
    return this.checkoutService.applyCoupon(id, dto);
  }

  @Delete(':id/coupon')
  @ApiOkResponse({ description: 'Coupon removed' })
  removeCoupon(@Param('id') id: string) {
    return this.checkoutService.removeCoupon(id);
  }
}
