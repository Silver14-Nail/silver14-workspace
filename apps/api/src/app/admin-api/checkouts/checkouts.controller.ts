import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { CheckoutsService } from './checkouts.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { CartListQueryDto } from './dto/cart-list-query.dto';
import { CheckoutSessionListQueryDto } from './dto/checkout-session-list-query.dto';

@ApiTags('Admin - Shipping Methods')
@ApiBearerAuth()
@Controller('checkouts/shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Get()
  @ApiOkResponse({ description: 'List of all shipping methods ordered by fee' })
  list() {
    return this.checkoutsService.listShippingMethods();
  }

  @Post()
  @ApiCreatedResponse({ description: 'Shipping method created' })
  create(@Body() dto: CreateShippingMethodDto) {
    return this.checkoutsService.createShippingMethod(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Shipping method detail' })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  getOne(@Param('id') id: string) {
    return this.checkoutsService.getShippingMethod(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated shipping method' })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.checkoutsService.updateShippingMethod(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Shipping method deleted' })
  @ApiNotFoundResponse({ description: 'Shipping method not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.checkoutsService.removeShippingMethod(id);
  }
}

@ApiTags('Admin - Carts')
@ApiBearerAuth()
@Controller('checkouts/carts')
export class CartsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of carts, filterable by status or user' })
  list(@Query() query: CartListQueryDto) {
    return this.checkoutsService.listCarts(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Cart detail with items and variant info' })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  getOne(@Param('id') id: string) {
    return this.checkoutsService.getCart(id);
  }
}

@ApiTags('Admin - Checkout Sessions')
@ApiBearerAuth()
@Controller('checkouts/sessions')
export class CheckoutSessionsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of checkout sessions, filterable by status' })
  list(@Query() query: CheckoutSessionListQueryDto) {
    return this.checkoutsService.listCheckoutSessions(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Checkout session detail with cart items and user/guest info' })
  @ApiNotFoundResponse({ description: 'Checkout session not found' })
  getOne(@Param('id') id: string) {
    return this.checkoutsService.getCheckoutSession(id);
  }
}
