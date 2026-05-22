import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
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
import { AddWhitelistUserDto } from './dto/add-whitelist-user.dto';

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('stats')
  @ApiOkResponse({ description: 'Coupon statistics' })
  getStats() {
    return this.couponsService.getStats();
  }

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

  @Patch(':id/activate')
  @ApiOkResponse({ description: 'Coupon activated' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  activate(@Param('id') id: string) {
    return this.couponsService.activateCoupon(id);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ description: 'Coupon deactivated' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  deactivate(@Param('id') id: string) {
    return this.couponsService.deactivateCoupon(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Coupon soft-deleted' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.removeCoupon(id);
  }

  // ─── Usages ─────────────────────────────────────────────────────────────────

  @Get(':id/usages')
  @ApiOkResponse({ description: 'Paginated coupon usage history' })
  @ApiNotFoundResponse({ description: 'Coupon not found' })
  listUsages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.couponsService.listCouponUsages(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ─── Restrictions ────────────────────────────────────────────────────────────

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

  // ─── Whitelist ───────────────────────────────────────────────────────────────

  @Post(':id/whitelist')
  @ApiCreatedResponse({ description: 'User added to coupon whitelist' })
  @ApiNotFoundResponse({ description: 'Coupon or user not found' })
  @ApiConflictResponse({ description: 'User already in whitelist' })
  addToWhitelist(@Param('id') id: string, @Body() dto: AddWhitelistUserDto) {
    return this.couponsService.addToWhitelist(id, dto);
  }

  @Delete(':id/whitelist/:whitelistId')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'User removed from whitelist' })
  @ApiNotFoundResponse({ description: 'Whitelist entry not found' })
  removeFromWhitelist(
    @Param('id') id: string,
    @Param('whitelistId') whitelistId: string,
  ): Promise<void> {
    return this.couponsService.removeFromWhitelist(id, whitelistId);
  }
}
