import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { PaymentListQueryDto } from './dto/payment-list-query.dto';

@ApiTags('Admin - Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of payments' })
  list(@Query() query: PaymentListQueryDto) {
    return this.paymentsService.listPayments(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Payment detail with order and gateway info' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  getOne(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }
}
