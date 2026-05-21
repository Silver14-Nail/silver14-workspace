import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';

import { ClientCouponsService } from './client-coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@ApiTags('Client - Coupons')
@Controller('coupons')
export class ClientCouponsController {
  constructor(private readonly couponsService: ClientCouponsService) {}

  @Post('validate')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Coupon validation result with discount preview' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(dto);
  }
}
