import {
  Body,
  Controller,
  Delete,
  Get,
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
} from '@nestjs/swagger';

import { CustomerJwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { ClientUserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SaveAddressDto } from './dto/save-address.dto';

@ApiTags('Client - User')
@ApiBearerAuth()
@UseGuards(CustomerJwtAuthGuard)
@Controller('user')
export class ClientUserController {
  constructor(private readonly userService: ClientUserService) {}

  // ─── Profile ──────────────────────────────────────────────────────────────────

  @Get('profile')
  @ApiOkResponse({ description: 'Own user profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user);
  }

  @Patch('profile')
  @ApiOkResponse({ description: 'Updated profile' })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user, dto);
  }

  // ─── Addresses ────────────────────────────────────────────────────────────────

  @Get('addresses')
  @ApiOkResponse({ description: 'List of saved addresses' })
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.listAddresses(user);
  }

  @Post('addresses')
  @ApiCreatedResponse({ description: 'Address added' })
  addAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: SaveAddressDto) {
    return this.userService.addAddress(user, dto);
  }

  @Patch('addresses/:id')
  @ApiOkResponse({ description: 'Address updated' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  updateAddress(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveAddressDto,
  ) {
    return this.userService.updateAddress(id, user, dto);
  }

  @Delete('addresses/:id')
  @ApiOkResponse({ description: 'Address deleted' })
  removeAddress(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.userService.removeAddress(id, user);
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOkResponse({ description: 'Paginated list of own orders' })
  listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.listMyOrders(
      user,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
