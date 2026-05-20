import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CustomerJwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { ClientOrdersService } from './orders.service';
import { TrackOrderQueryDto } from './dto/track-order-query.dto';
import { MyOrdersQueryDto } from './dto/my-orders-query.dto';

@ApiTags('Client Orders')
@Controller('orders')
export class ClientOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get('track')
  @ApiOperation({ summary: 'Track an order by ID and contact phone number' })
  trackOrder(@Query() query: TrackOrderQueryDto) {
    return this.ordersService.trackOrder(query);
  }
}

@ApiTags('Client Orders')
@ApiBearerAuth()
@UseGuards(CustomerJwtAuthGuard)
@Controller('orders/my')
export class ClientMyOrdersController {
  constructor(private readonly ordersService: ClientOrdersService) {}

  @Get()
  @ApiOperation({ summary: "List authenticated customer's own orders" })
  getMyOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: MyOrdersQueryDto) {
    return this.ordersService.getMyOrders(user, query);
  }

  @Get(':orderId')
  @ApiOperation({ summary: "Get detail of an authenticated customer's specific order" })
  getMyOrder(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.ordersService.getMyOrder(user, orderId);
  }
}
