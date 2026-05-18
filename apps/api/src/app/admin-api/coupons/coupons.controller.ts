import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { CouponsService } from './coupons.service';
import { CouponListQueryDto } from './dto/coupon-list-query.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AddRestrictionDto } from './dto/add-restriction.dto';

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of coupons' })
  list(@Query() query: CouponListQueryDto) {
    return this.couponsService.listCoupons(query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Coupon created' })
  @ApiConflictResponse({ description: 'Coupon code already exists' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Coupon detail with restrictions, whitelist and usages' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  getOne(@Param('id') id: string) {
    return this.couponsService.getCoupon(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated coupon' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  @ApiConflictResponse({ description: 'Coupon code already exists' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.updateCoupon(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Coupon soft-deleted' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.removeCoupon(id);
  }

  @Post(':id/restrictions')
  @ApiCreatedResponse({ description: 'Restriction added to coupon' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  addRestriction(@Param('id') id: string, @Body() dto: AddRestrictionDto) {
    return this.couponsService.addRestriction(id, dto);
  }

  @Delete(':id/restrictions/:restrictionId')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Restriction removed' })
  @ApiNotFoundResponse({ description: 'Restriction not found' })
  removeRestriction(
    @Param('id') id: string,
    @Param('restrictionId') restrictionId: string,
  ): Promise<void> {
    return this.couponsService.removeRestriction(id, restrictionId);
  }
}
