import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClientOrdersService } from './orders.service';
import { TrackOrderQueryDto } from './dto/track-order-query.dto';

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
