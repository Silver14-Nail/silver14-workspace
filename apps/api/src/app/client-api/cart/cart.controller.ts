import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';

import { OptionalCustomerJwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { MaybeCurrentUser } from '@/shared/auth/decorators/maybe-current-user.decorator';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { ClientCartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Client - Cart')
@ApiBearerAuth()
@ApiHeader({ name: 'x-cart-id', required: false, description: 'Guest cart ID (UUID)' })
@UseGuards(OptionalCustomerJwtAuthGuard)
@Controller('cart')
export class ClientCartController {
  constructor(private readonly cartService: ClientCartService) {}

  @Get()
  @ApiOkResponse({ description: 'Active cart with items, or null if none' })
  getCart(
    @Headers('x-cart-id') cartId: string | undefined,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.getCart(user?.id, cartId);
  }

  @Post('items')
  @ApiCreatedResponse({ description: 'Item added — returns { cart, cartId }' })
  addItem(
    @Body() dto: AddCartItemDto,
    @Headers('x-cart-id') cartId: string | undefined,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.addItem(dto, user?.id, cartId);
  }

  @Patch('items/:itemId')
  @ApiOkResponse({ description: 'Updated cart after quantity change' })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Headers('x-cart-id') cartId: string | undefined,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.updateItem(itemId, dto, user?.id, cartId);
  }

  @Delete('items/:itemId')
  @ApiOkResponse({ description: 'Updated cart after item removal' })
  removeItem(
    @Param('itemId') itemId: string,
    @Headers('x-cart-id') cartId: string | undefined,
    @MaybeCurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.removeItem(itemId, user?.id, cartId);
  }
}
