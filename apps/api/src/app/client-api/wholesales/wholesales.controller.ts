import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { CustomerJwtAuthGuard } from '@/shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { ClientWholesalesService } from './wholesales.service';
import { SubmitEnquiryDto } from './dto/submit-enquiry.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UnsubscribeNewsletterDto } from './dto/unsubscribe-newsletter.dto';
import { WholesaleOrdersQueryDto } from './dto/wholesale-orders-query.dto';

// ─── Wholesale Enquiry ────────────────────────────────────────────────────────

@ApiTags('Client - Wholesale')
@Controller('wholesales')
export class WholesaleEnquiryController {
  constructor(private readonly wholesalesService: ClientWholesalesService) {}

  @Post('enquire')
  @ApiCreatedResponse({ description: 'Enquiry submitted, admin will review' })
  submitEnquiry(@Body() dto: SubmitEnquiryDto) {
    return this.wholesalesService.submitEnquiry(dto);
  }
}

// ─── Wholesale Account (authenticated) ───────────────────────────────────────

@ApiTags('Client - Wholesale')
@ApiBearerAuth()
@UseGuards(CustomerJwtAuthGuard)
@Controller('wholesales/account')
export class WholesaleAccountController {
  constructor(private readonly wholesalesService: ClientWholesalesService) {}

  @Get()
  @ApiOkResponse({ description: 'Own wholesale account info with tier details' })
  @ApiNotFoundResponse({ description: 'No active wholesale account found' })
  getMyAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.wholesalesService.getMyAccount(user);
  }

  @Get('orders')
  @ApiOkResponse({ description: 'Paginated list of own wholesale orders' })
  getMyOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: WholesaleOrdersQueryDto) {
    return this.wholesalesService.getMyOrders(user, query);
  }
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

@ApiTags('Client - Newsletter')
@Controller('wholesales/newsletter')
export class NewsletterController {
  constructor(private readonly wholesalesService: ClientWholesalesService) {}

  @Post('subscribe')
  @ApiCreatedResponse({ description: 'Successfully subscribed' })
  @ApiConflictResponse({ description: 'Email already subscribed' })
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.wholesalesService.subscribe(dto);
  }

  @Post('unsubscribe')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Successfully unsubscribed' })
  unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.wholesalesService.unsubscribe(dto);
  }
}
