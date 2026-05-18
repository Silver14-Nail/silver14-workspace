import { Controller, Get, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated order' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Order soft-deleted' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.removeOrder(id);
  }
}
