import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateShippingFeeDto } from './dto/update-shipping-fee.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  @ApiOkResponse({ description: 'Order counts and revenue stats' })
  getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated list of orders' })
  list(@Query() query: OrderListQueryDto) {
    return this.ordersService.listOrders(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Order detail with items and payment' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  getOne(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Patch(':id/status')
  @ApiOkResponse({ description: 'Order with updated status' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Patch(':id/payment-status')
  @ApiOkResponse({ description: 'Updated payment record' })
  @ApiNotFoundResponse({ description: 'Order or payment not found' })
  updatePaymentStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.ordersService.updatePaymentStatus(id, dto);
  }

  @Patch(':id/shipping')
  @ApiOkResponse({ description: 'Order with updated shipping info' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  updateShipping(@Param('id') id: string, @Body() dto: UpdateShippingDto) {
    return this.ordersService.updateShipping(id, dto);
  }

  @Patch(':id/shipping-fee')
  @ApiOkResponse({ description: 'Order with overridden shipping fee and recalculated total' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  updateShippingFee(@Param('id') id: string, @Body() dto: UpdateShippingFeeDto) {
    return this.ordersService.updateShippingFee(id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Cancelled order' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Order cannot be cancelled' })
  cancel(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancelOrder(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Order soft-deleted' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.removeOrder(id);
  }
}
